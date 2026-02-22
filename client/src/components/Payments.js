import axios from "axios";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Header } from "./Header";

export default function Payments() {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const headers = [
    "Date",
    "Seniority No.",
    "Name",
    "Project",
    "Payment Mode",
    "Payment Type",
    "Amount",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:3001/receipts")
      .then((res) => setTableData(res.data.data || []))
      .catch((err) => console.error("Unable to fetch receipts:", err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paymentTypes = useMemo(() => {
    return [...new Set(tableData.map((r) => r.paymenttype).filter(Boolean))];
  }, [tableData]);

  const typeSums = useMemo(() => {
    const map = {};
    tableData.forEach((r) => {
      const type = r.paymenttype || "Unknown";
      map[type] =
        (map[type] || 0) + Number(r.totalreceived ?? r.amountpaid ?? 0);
    });
    return map;
  }, [tableData]);

  const filteredData = useMemo(() => {
    return tableData.filter((r) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        (r.seniority_no || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchType = filterType === "All" || r.paymenttype === filterType;
      return matchSearch && matchType;
    });
  }, [tableData, searchQuery, filterType]);

  const filteredTotal = useMemo(
    () =>
      filteredData.reduce(
        (s, r) => s + Number(r.totalreceived ?? r.amountpaid ?? 0),
        0,
      ),
    [filteredData],
  );

  const handleSelectType = (type) => {
    setFilterType(type);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="px-[50px] pt-[50px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-[24px]">Transactions Details</h1>

          {/* Right side: Filter + Sum badge + Search */}
          <div className="flex items-center gap-3">
            {/* Filter button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  filterType !== "All"
                    ? "bg-[#8356D6] text-white border-[#8356D6]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#8356D6] hover:text-[#8356D6]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                Filter
                {filterType !== "All" && (
                  <span className="bg-white text-[#8356D6] text-xs font-bold px-1.5 py-0.5 rounded-full">
                    1
                  </span>
                )}
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-[260px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Payment Type
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectType("All")}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 transition-colors ${
                      filterType === "All"
                        ? "bg-purple-50 text-[#8356D6] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>All Types</span>
                    {filterType === "All" && (
                      <svg
                        className="w-4 h-4 text-[#8356D6]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  {paymentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSelectType(type)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                        filterType === type
                          ? "bg-purple-50 text-[#8356D6] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{type}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${filterType === type ? "text-[#8356D6]" : "text-gray-400"}`}
                        >
                          ₹{(typeSums[type] || 0).toLocaleString("en-IN")}
                        </span>
                        {filterType === type && (
                          <svg
                            className="w-4 h-4 text-[#8356D6]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sum badge — only when a type is selected */}
            {filterType !== "All" && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                <span className="text-xs text-gray-500 font-medium">
                  {filterType}:
                </span>
                <span className="text-sm font-bold text-[#8356D6]">
                  ₹{filteredTotal.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => setFilterType("All")}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Search — right side, just filters silently */}
            <div className="relative w-[300px]">
              <input
                type="text"
                placeholder="Search by Seniority Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] focus:border-transparent"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full max-w-[1120px] mx-auto p-6">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#8356D6]">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-center text-white font-semibold text-base tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.map((receipt, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-200 text-center hover:bg-purple-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.date
                      ? new Date(receipt.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.seniority_no || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.projectname || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.paymentmode || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.paymenttype || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    ₹
                    {Number(
                      receipt.totalreceived ?? receipt.amountpaid ?? 0,
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-purple-50 border-t-2 border-[#8356D6]">
                  <td
                    colSpan={6}
                    className="px-6 py-3 text-right font-bold text-[#8356D6] text-sm"
                  >
                    {filterType === "All"
                      ? "Grand Total"
                      : `${filterType} Total`}
                    &nbsp;({filteredData.length}{" "}
                    {filteredData.length === 1 ? "record" : "records"})
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-green-700 text-sm">
                    ₹{filteredTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {filteredData.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {searchQuery || filterType !== "All"
                ? "No receipts match the current filters."
                : "No receipts found."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

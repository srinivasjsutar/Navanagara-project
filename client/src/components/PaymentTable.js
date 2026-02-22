import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";

export default function PaymentTable() {
  const [tableData, setTableData]     = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode]   = useState("All");   // Payment Mode filter
  const [filterType, setFilterType]   = useState("All");   // Payment Type filter

  const headers = [
    "Date",
    "Seniority No",
    "Name",
    "Project",
    "Payment Mode",
    "Payment Type",
    "Amount",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:3001/receipts")
      .then((response) => setTableData(response.data.data || []))
      .catch((err) => console.error("Unable to fetch the data!..", err));
  }, []);

  // ── Unique filter options derived from data ──
  const paymentModes = useMemo(() => {
    const modes = [...new Set(tableData.map((r) => r.paymentmode).filter(Boolean))];
    return ["All", ...modes];
  }, [tableData]);

  const paymentTypes = useMemo(() => {
    const types = [...new Set(tableData.map((r) => r.paymenttype).filter(Boolean))];
    return ["All", ...types];
  }, [tableData]);

  // ── Filtered data ──
  const filteredData = useMemo(() => {
    return tableData.filter((receipt) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        (receipt.seniority_no || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        filterMode === "All" || receipt.paymentmode === filterMode;
      const matchesType =
        filterType === "All" || receipt.paymenttype === filterType;
      return matchesSearch && matchesMode && matchesType;
    });
  }, [tableData, searchQuery, filterMode, filterType]);

  // ── Total of filtered rows ──
  const totalAmount = useMemo(
    () =>
      filteredData.reduce(
        (sum, r) => sum + Number(r.totalreceived ?? r.amountpaid ?? 0),
        0
      ),
    [filteredData]
  );

  const resetFilters = () => {
    setSearchQuery("");
    setFilterMode("All");
    setFilterType("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || filterMode !== "All" || filterType !== "All";

  return (
    <div className="w-full max-w-[1070px] mx-auto p-6">

      {/* ── Controls bar ── */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            placeholder="Search by Seniority No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Payment Mode filter */}
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] bg-white"
        >
          {paymentModes.map((m) => (
            <option key={m} value={m}>{m === "All" ? "All Modes" : m}</option>
          ))}
        </select>

        {/* Payment Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] bg-white"
        >
          {paymentTypes.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>
          ))}
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-[#8356D6] border border-[#8356D6] rounded-lg hover:bg-purple-50 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Summary bar ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
          <span className="text-xs text-gray-500 font-medium">Records</span>
          <span className="text-sm font-bold text-[#8356D6]">{filteredData.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <span className="text-xs text-gray-500 font-medium">Total Amount</span>
          <span className="text-sm font-bold text-green-700">₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
        {filterMode !== "All" && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-500 font-medium">Mode</span>
            <span className="text-sm font-bold text-blue-700">{filterMode}</span>
          </div>
        )}
        {filterType !== "All" && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <span className="text-xs text-gray-500 font-medium">Type</span>
            <span className="text-sm font-bold text-orange-700">{filterType}</span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-[#8356D6]">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4 text-center text-white font-semibold text-base tracking-wide">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredData.map((receipt, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200 text-center hover:bg-purple-50 transition-colors duration-200">
                <td className="px-6 py-4 text-gray-700 font-medium">
                  {receipt.date ? new Date(receipt.date).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">{receipt.seniority_no || "-"}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{receipt.name || "-"}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{receipt.projectname || "-"}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{receipt.paymentmode || "-"}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{receipt.paymenttype || "-"}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">
                  ₹{Number(receipt.totalreceived ?? receipt.amountpaid ?? 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>

          {/* ── Total row ── */}
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="bg-purple-50 border-t-2 border-[#8356D6]">
                <td colSpan={6} className="px-6 py-3 text-right font-bold text-[#8356D6] text-sm">
                  Total ({filteredData.length} {filteredData.length === 1 ? "record" : "records"})
                </td>
                <td className="px-6 py-3 text-center font-bold text-green-700 text-sm">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {filteredData.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            {hasActiveFilters ? `No receipts match the current filters.` : "No receipts found."}
          </div>
        )}
      </div>
    </div>
  );
}
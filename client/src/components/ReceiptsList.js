import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { generateReceiptPDF } from "../utils/generateReceiptPDF";

export function ReceiptList() {
  const isSuperAdmin = !!localStorage.getItem("superAdminToken");
  const headers = [
    "Date",
    "Seniority No.",
    "Transaction ID",
    "Name",
    "Amount",
    "",
  ];
  const [Memberdetails, SetMemberDetails] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);

  // Download receipt PDF — same format as ReceiptForm
  const handleDownloadReceipt = async (receipt) => {
    setDownloadingId(receipt._id);
    try {
      await generateReceiptPDF(receipt);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/receipts")
      .then((response) => {
        SetMemberDetails(response.data.data || []);
        setFilteredMembers(response.data.data || []);
      })
      .catch((err) => console.error("Unable to fetch the data", err));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(Memberdetails);
    } else {
      const filtered = Memberdetails.filter((member) =>
        member.seniority_no?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, Memberdetails]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => setSearchQuery("");

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setEditData(member);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:3001/receipts/${selectedMember._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
        },
      );
      SetMemberDetails(
        Memberdetails.map((m) => (m._id === selectedMember._id ? editData : m)),
      );
      setFilteredMembers(
        filteredMembers.map((m) =>
          m._id === selectedMember._id ? editData : m,
        ),
      );
      setSelectedMember(editData);
      setIsEditing(false);
      alert("Receipt updated successfully!");
    } catch (err) {
      console.error("Error updating", err);
      alert("Failed to update receipt.");
    }
  };

  const editField = (label, name, value) => (
    <div className="border-b border-gray-200 pb-4">
      <dt className="inline font-semibold">{label}: </dt>
      {isEditing && !selectedMember?.cancelled ? (
        <input
          name={name}
          value={editData[name] || ""}
          onChange={handleEditChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm ml-1"
        />
      ) : (
        <dd className="inline font-normal">{value || "-"}</dd>
      )}
    </div>
  );

  return (
    <div>
      <Header />
      <div className="px-[50px] pt-[50px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-[24px]">All Receipt List</h1>
          <div className="relative w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Seniority No."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] focus:border-transparent"
              />
              <svg
                className="absolute left-60 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              {searchQuery && (
                <button
                  onClick={clearSearch}
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
              )}
            </div>
            {searchQuery && (
              <div className="absolute top-full mt-2 text-sm text-gray-600">
                Found {filteredMembers.length} result
                {filteredMembers.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1120px] mx-auto p-6">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#8356D6]">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-start text-white font-semibold text-base tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredMembers.map((member, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 text-start text-[14px] transition-colors duration-200 ${member.cancelled ? "bg-red-50" : "hover:bg-purple-50"}`}
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.date
                      ? new Date(member.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.seniority_no || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.transactionid || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.amountpaid
                      ? `Rs.${Number(member.amountpaid).toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td>
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="w-[130px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(member)}
                        disabled={downloadingId === member._id}
                        className="w-[110px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {downloadingId === member._id ? (
                          "..."
                        ) : (
                          <>
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                      {member.cancelled && (
                        <div className="my-2">
                          {" "}
                          <span className="bg-red-100 text-red-600 text-center text-xs font-semibold px-2 py-1 mt-2 rounded-full">
                            Cancelled
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="p-6 text-center text-red-600">
              {searchQuery
                ? `No receipts found for "${searchQuery}"`
                : "Not found."}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-4 flex justify-between items-center">
              <button
                onClick={closeModal}
                className="flex items-center gap-2 text-[#8356D6] border border-[#8356D6] px-4 py-2 rounded-full hover:bg-purple-50 transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Back to Receipt List</span>
              </button>

              <div className="flex items-center gap-3">
                {/* Cancelled badge in modal */}
                {selectedMember.cancelled && (
                  <span className="bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-full border border-red-300">
                    ✕ Cancelled
                  </span>
                )}

                {/* Edit buttons only if NOT cancelled and superadmin */}
                {isSuperAdmin && !selectedMember.cancelled && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-[#7C66CA] text-white px-4 py-2 rounded-full font-semibold hover:opacity-90"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="border border-gray-400 text-gray-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-[#FFFF00] via-[#7158B6] to-[#7158B6] text-white px-6 py-2 rounded-full font-semibold hover:opacity-90"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div
                className={`bg-white border rounded-2xl p-6 ${selectedMember.cancelled ? "border-red-300" : "border-gray-200"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">Receipt Details</h2>
                    {/* {selectedMember.cancelled && (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">Cancelled</span>
                    )} */}
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                    {selectedMember.image ? (
                      <img
                        src={selectedMember.image}
                        alt="Member"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <dl className="flex gap-[70px] mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/person_1.svg"
                      alt="Person icon"
                      className="pb-1"
                    />
                    <div className="flex">
                      <dt className="text-[#8356D6] font-medium text-[16px]">
                        Name:
                      </dt>
                      &nbsp;
                      <dd className="font-semibold text-[16px] text-[#595757]">
                        {selectedMember.name || "-"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/assignment_ind.png"
                      alt="ID icon"
                      className="pb-1"
                    />
                    <div className="flex">
                      <dt className="text-[#8356D6] font-medium text-[16px]">
                        Seniority No:
                      </dt>
                      &nbsp;
                      <dd className="font-semibold text-[16px] text-[#595757]">
                        {selectedMember.seniority_no || "-"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/call.svg"
                      alt="Phone icon"
                      className="pb-1"
                    />
                    <div className="flex">
                      <dt className="text-[#8356D6] font-medium text-[16px]">
                        Mobile:
                      </dt>
                      &nbsp;
                      <dd className="font-semibold text-[16px] text-[#595757]">
                        {selectedMember.mobilenumber || "-"}
                      </dd>
                    </div>
                  </div>
                </dl>

                <dl className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {editField(
                    "Transaction ID",
                    "transactionid",
                    selectedMember.transactionid,
                  )}
                  {editField(
                    "Receipt Date",
                    "date",
                    selectedMember.date
                      ? new Date(selectedMember.date).toLocaleDateString()
                      : "-",
                  )}
                  {editField(
                    "Project Name",
                    "projectname",
                    selectedMember.projectname,
                  )}
                  {editField(
                    "Site Dimension",
                    "sitedimension",
                    selectedMember.sitedimension || selectedMember.dimension,
                  )}
                  {editField(
                    "Payment Type",
                    "paymenttype",
                    selectedMember.paymenttype,
                  )}
                  {editField(
                    "Paid Amount",
                    "amountpaid",
                    selectedMember.amountpaid,
                  )}
                  {editField(
                    "Payment Mode",
                    "paymentmode",
                    selectedMember.paymentmode,
                  )}
                  {editField("Select Bank", "bank", selectedMember.bank)}
                  <div className="col-span-2 flex justify-end pt-2">
                    <button
                      onClick={() => handleDownloadReceipt(selectedMember)}
                      disabled={downloadingId === selectedMember._id}
                      className="flex items-center gap-2 font-medium border py-[8px] px-[20px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {downloadingId === selectedMember._id
                        ? "Generating..."
                        : "Download Receipt"}
                    </button>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { toast } from "react-toastify";

export function SiteBookingList() {
  const isSuperAdmin = !!localStorage.getItem("superAdminToken");
  const isAdmin = !!localStorage.getItem("adminToken");
  const canCancel = isSuperAdmin || isAdmin;

  const headers = ["Date", "Member Name", "Seniority No.", "Project Name", ""];
  const [Memberdetails, SetMemberDetails] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [memberDetailsData, setMemberDetailsData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelPdf, setCancelPdf] = useState(null);
  const [cancellingMember, setCancellingMember] = useState(null);

  // Receipt-based payment tracking
  const [memberReceipts, setMemberReceipts] = useState([]);
  const [isFetchingReceipts, setIsFetchingReceipts] = useState(false);

  // Project → Seniority prefix map
  const projectPrefixMap = {
    "New City 1": "NCS",
    "New City": "NCG",
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/sitebookings")
      .then((response) => {
        SetMemberDetails(response.data || []);
        setFilteredMembers(response.data || []);
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

  const handleViewDetails = async (member) => {
    setSelectedMember(member);
    setEditData(member);
    setIsModalOpen(true);
    setShowMemberDetails(false);
    setMemberDetailsData(null);
    setIsEditing(false);
    setMemberReceipts([]);

    // Fetch receipts for this member's seniority_no
    setIsFetchingReceipts(true);
    try {
      const token =
        localStorage.getItem("superAdminToken") ||
        localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:3001/receipts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allReceipts = res.data?.data || [];
      const filtered = allReceipts.filter(
        (r) => r.seniority_no === member.seniority_no && !r.cancelled,
      );
      setMemberReceipts(filtered);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setIsFetchingReceipts(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setShowMemberDetails(false);
    setMemberDetailsData(null);
    setIsEditing(false);
    setMemberReceipts([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Project dropdown change — auto-update seniority prefix
  const handleProjectChange = (e) => {
    const newProject = e.target.value;

    setEditData((prev) => {
      const oldPrefix = Object.values(projectPrefixMap).find((p) =>
        prev.seniority_no?.startsWith(p),
      );
      const newPrefix = projectPrefixMap[newProject];

      let updatedSeniorityNo = prev.seniority_no || "";
      if (oldPrefix && newPrefix && oldPrefix !== newPrefix) {
        updatedSeniorityNo = updatedSeniorityNo.replace(oldPrefix, newPrefix);
      }

      return {
        ...prev,
        projectname: newProject,
        seniority_no: updatedSeniorityNo,
      };
    });
  };

  const handleSave = async () => {
    const token =
      localStorage.getItem("superAdminToken") ||
      localStorage.getItem("adminToken");

    // Send only the editable fields — avoids sending Mongoose internals
    const payload = {
      seniority_no: editData.seniority_no,
      name: editData.name,
      projectname: editData.projectname,
      sitedimension: editData.sitedimension,
      transactionid: editData.transactionid,
      bookingamount: editData.bookingamount,
      downpayment: editData.downpayment,
      paymentmode: editData.paymentmode,
      totalamount: editData.totalamount,
      date: editData.date,
      installments: editData.installments,
      bank: editData.bank,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/sitebookings/${selectedMember._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        // Merge updated payload back into the full member object (keeps _id etc.)
        const updatedMember = { ...selectedMember, ...payload };
        SetMemberDetails((prev) =>
          prev.map((m) => (m._id === selectedMember._id ? updatedMember : m)),
        );
        setFilteredMembers((prev) =>
          prev.map((m) => (m._id === selectedMember._id ? updatedMember : m)),
        );
        setSelectedMember(updatedMember);
        setEditData(updatedMember);
        setIsEditing(false);
        toast.success("Site booking updated successfully!");
      } else {
        toast.error(response.data?.message || "Failed to update site booking.");
      }
    } catch (err) {
      console.error("Error updating:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || "Failed to update site booking.",
      );
    }
  };

  const handleViewMemberDetails = async () => {
    try {
      const response = await axios.get("http://localhost:3001/members");
      const members = response.data.data || [];
      const memberData = members.find(
        (member) => member.seniority_no === selectedMember.seniority_no,
      );
      if (memberData) {
        setMemberDetailsData(memberData);
        setShowMemberDetails(true);
      } else {
        toast.error("Member details not found!");
      }
    } catch (err) {
      toast.error("Error fetching member details!");
    }
  };

  const handleBackToSiteBooking = () => {
    setShowMemberDetails(false);
    setMemberDetailsData(null);
  };

  // Correct calculation: Paid = sum of all non-cancelled receipts, Remaining = totalAmount - paidAmount
  const calculatePaymentSummary = (member) => {
    const totalAmount = parseFloat(member.totalamount) || 0;
    const paidAmount = memberReceipts.reduce(
      (sum, r) => sum + (parseFloat(r.amountpaid) || 0),
      0,
    );
    const remainingAmount = totalAmount - paidAmount;
    return { totalAmount, paidAmount, remainingAmount };
  };

  const handleCancelClick = (member) => {
    setCancellingMember(member);
    setShowCancelPopup(true);
  };

  const handleCancelPdfChange = (e) => {
    setCancelPdf(e.target.files[0]);
  };

  const handleCancelOk = async () => {
    if (!cancelPdf) {
      toast.error("Please upload a cancellation PDF!");
      return;
    }
    const formData = new FormData();
    formData.append("cancellationPdf", cancelPdf);
    formData.append("bookingId", cancellingMember._id);

    const token =
      localStorage.getItem("superAdminToken") ||
      localStorage.getItem("adminToken");

    try {
      await axios.post("http://localhost:3001/sitebooking/cancel", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updateCancelled = (list) =>
        list.map((m) =>
          m._id === cancellingMember._id ? { ...m, cancelled: true } : m,
        );
      SetMemberDetails((prev) => updateCancelled(prev));
      setFilteredMembers((prev) => updateCancelled(prev));
      toast.success("Site booking cancelled successfully!");
      setShowCancelPopup(false);
      setCancelPdf(null);
      setCancellingMember(null);
    } catch (err) {
      console.error("Cancellation error", err);
      toast.error("Failed to submit cancellation.");
    }
  };

  const handleCancelPopupClose = () => {
    setShowCancelPopup(false);
    setCancelPdf(null);
    setCancellingMember(null);
  };

  // Generic editable field
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
          <h1 className="font-semibold text-[24px]">All Sitebookings List</h1>

          {/* Search bar */}
          <div className="relative w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Seniority Number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8356D6] focus:border-transparent"
              />
              {searchQuery ? (
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
            {searchQuery && (
              <div className="absolute top-full mt-2 text-sm text-gray-600">
                Found {filteredMembers.length} result
                {filteredMembers.length !== 1 ? "s" : ""}
              </div>
            )}
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
                  className={`border-b border-gray-200 text-start text-[14px] transition-colors duration-200 ${
                    member.cancelled ? "bg-red-50" : "hover:bg-purple-50"
                  }`}
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.date
                      ? new Date(member.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      {member.name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.seniority_no || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.projectname || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="w-[170px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200"
                      >
                        View Details
                      </button>
                      {member.cancelled && (
                        <span className="bg-red-100 text-red-600 text-center text-xs font-semibold px-2 py-1 rounded-full">
                          Cancelled
                        </span>
                      )}
                      {canCancel && !member.cancelled && (
                        <button
                          onClick={() => handleCancelClick(member)}
                          className="w-[100px] font-medium border-1 py-[6px] px-[10px] border-red-500 rounded text-[14px] text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                        >
                          Cancel
                        </button>
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
                ? `No bookings found for "${searchQuery}"`
                : "Not found."}
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 flex justify-between items-center">
              <button
                onClick={
                  showMemberDetails ? handleBackToSiteBooking : closeModal
                }
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
                <span className="font-medium">Back to Site Booking</span>
              </button>

              <div className="flex items-center gap-3">
                {selectedMember.cancelled && (
                  <span className="bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-full border border-red-300">
                    ✕ Cancelled
                  </span>
                )}

                {isSuperAdmin &&
                  !showMemberDetails &&
                  !selectedMember.cancelled && (
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

            {/* Site Booking Details */}
            {!showMemberDetails && (
              <div className="px-6 pb-6">
                <div
                  className={`bg-white border rounded-2xl p-6 ${
                    selectedMember.cancelled
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-semibold">
                      Site Booking Details
                    </h2>
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

                  {/* Top info row */}
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
                          {/* Show live editData seniority when editing */}
                          {isEditing
                            ? editData.seniority_no || "-"
                            : selectedMember.seniority_no || "-"}
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

                  {/* Editable fields grid */}
                  <dl className="grid grid-cols-2 gap-x-12 gap-y-6">
                    {/* ✅ Project Name — dropdown when editing */}
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Project Name: </dt>
                      {isEditing && !selectedMember?.cancelled ? (
                        <select
                          name="projectname"
                          value={editData.projectname || ""}
                          onChange={handleProjectChange}
                          className="border border-gray-300 rounded px-2 py-1 text-sm ml-1"
                        >
                          <option value="">Select Project</option>
                          {Object.keys(projectPrefixMap).map((project) => (
                            <option key={project} value={project}>
                              {project}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <dd className="inline font-normal">
                          {selectedMember.projectname || "-"}
                        </dd>
                      )}
                    </div>

                    {/* ✅ Seniority No — auto-updates on project change, still manually editable */}
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Seniority No: </dt>
                      {isEditing && !selectedMember?.cancelled ? (
                        <input
                          name="seniority_no"
                          value={editData.seniority_no || ""}
                          onChange={handleEditChange}
                          className="border border-gray-300 rounded px-2 py-1 text-sm ml-1"
                        />
                      ) : (
                        <dd className="inline font-normal">
                          {selectedMember.seniority_no || "-"}
                        </dd>
                      )}
                    </div>

                    {editField(
                      "Site Dimension",
                      "sitedimension",
                      selectedMember.sitedimension,
                    )}
                    {editField(
                      "Transaction Id",
                      "transactionid",
                      selectedMember.transactionid,
                    )}
                    {editField(
                      "Booking Amount",
                      "bookingamount",
                      selectedMember.bookingamount,
                    )}
                    {editField(
                      "Down Payment",
                      "downpayment",
                      selectedMember.downpayment,
                    )}
                    {editField(
                      "Payment Mode",
                      "paymentmode",
                      selectedMember.paymentmode,
                    )}
                    {editField(
                      "Total Amount",
                      "totalamount",
                      selectedMember.totalamount,
                    )}

                    {/* Payment Summary — calculated from receipts */}
                    {(() => {
                      const { totalAmount, paidAmount, remainingAmount } =
                        calculatePaymentSummary(selectedMember);
                      return (
                        <>
                          <div className="border-b border-gray-200 pb-4">
                            <dt className="inline font-semibold">
                              Paid Amount:{" "}
                            </dt>
                            <dd className="inline font-normal text-green-600 font-semibold">
                              {isFetchingReceipts
                                ? "Loading..."
                                : `₹${paidAmount.toLocaleString("en-IN")}`}
                            </dd>
                          </div>
                          <div className="border-b border-gray-200 pb-4">
                            <dt className="inline font-semibold">
                              Remaining Amount:{" "}
                            </dt>
                            <dd
                              className={`inline font-semibold ${remainingAmount > 0 ? "text-red-500" : "text-green-600"}`}
                            >
                              {isFetchingReceipts
                                ? "Loading..."
                                : `₹${remainingAmount.toLocaleString("en-IN")}`}
                            </dd>
                          </div>
                        </>
                      );
                    })()}
                  </dl>

                  <div className="text-center mt-6">
                    <button
                      onClick={handleViewMemberDetails}
                      className="bg-gradient-to-r from-[#FFFF00] via-[#7158B6] to-[#7158B6] px-6 py-2 rounded-full text-white font-semibold text-[16px] hover:opacity-90 transition-opacity"
                    >
                      View Member Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Full Member Details */}
            {showMemberDetails && memberDetailsData && (
              <div className="px-6 pb-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-semibold">Member Details</h2>
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                      {memberDetailsData.image ? (
                        <img
                          src={memberDetailsData.image}
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
                          {memberDetailsData.name || "-"}
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
                          {memberDetailsData.seniority_no || "-"}
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
                          {memberDetailsData.mobile || "-"}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <dl className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Application Number:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.applicationno || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Membership Type:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.membershiptype || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Membership Date:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.membershipday || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Membership Fees:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.membershipfees || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Email: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.email || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">DOB: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.dob
                          ? new Date(memberDetailsData.dob).toLocaleDateString()
                          : "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Aadhar Number: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.aadharnumber || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Birth Place: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.birthplace || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Alternate Mobile:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.alternatemobile || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Alternate Email:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.alternateemail || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Permanent Address:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.permanentaddress || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Correspondence Address:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.correspondenceaddress || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Nominee Name: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.nomineename || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Nominee Mobile: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.nomineenumber || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">Nominee Age: </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.nomineeage || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">
                        Nominee Relationship:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.nomineerelationship || "-"}
                      </dd>
                    </div>
                    <div className="border-b border-gray-200 pb-4 col-span-2">
                      <dt className="inline font-semibold">
                        Nominee Address:{" "}
                      </dt>
                      <dd className="inline font-normal">
                        {memberDetailsData.nomineeaddress || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] p-6">
            <h2 className="text-xl font-semibold mb-2">Cancel Site Booking</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel the booking for{" "}
              <span className="font-semibold text-[#8356D6]">
                {cancellingMember?.name}
              </span>
              ? Please upload a cancellation PDF to proceed.
            </p>
            <div className="border-2 border-dashed border-[#8356D6] rounded-xl p-6 text-center mb-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleCancelPdfChange}
                className="hidden"
                id="cancelPdfInput"
              />
              <label htmlFor="cancelPdfInput" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10 text-[#8356D6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-[#8356D6] font-medium">
                    {cancelPdf
                      ? cancelPdf.name
                      : "Click to upload cancellation PDF"}
                  </span>
                </div>
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelPopupClose}
                className="px-6 py-2 border border-gray-400 text-gray-600 rounded-full font-semibold hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleCancelOk}
                className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600"
              >
                OK - Submit Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

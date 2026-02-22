import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateReceiptPDF } from "../utils/generateReceiptPDF";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

export function MemberDashboard() {
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [siteBooking, setSiteBooking] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const stored = localStorage.getItem("memberData");
    if (stored) {
      const data = JSON.parse(stored);
      setMemberData(data);
      fetchData(data.seniority_no);
    }
  }, []);

  const fetchData = async (seniority_no) => {
    try {
      const token = localStorage.getItem("memberToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch site booking
      const bookingsRes = await axios.get(`${API_BASE}/sitebookings`, {
        headers,
      });
      const booking = (bookingsRes.data || []).find(
        (b) => b.seniority_no === seniority_no,
      );
      setSiteBooking(booking || null);

      // Fetch receipts for this member
      const receiptsRes = await axios.get(`${API_BASE}/receipts`, { headers });
      const memberReceipts = (receiptsRes.data?.data || []).filter(
        (r) => r.seniority_no === seniority_no,
      );
      setReceipts(memberReceipts);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberData");
    navigate("/memberlogin", { replace: true });
  };

  const handleViewDetails = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  // Calculate amounts from site booking + receipts
  const totalAmount = siteBooking
    ? parseFloat(siteBooking.totalamount) || 0
    : 0;
  const paidAmount = receipts.reduce(
    (sum, r) => sum + (parseFloat(r.amountpaid) || 0),
    0,
  );
  const pendingAmount = totalAmount - paidAmount;

  const tableHeaders = ["Date", "Receipt No.", "Transaction ID", "Amount", ""];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-10 py-[18px] shadow-sm bg-white">
        <div className="font-semibold text-[30px] text-[#7C66CA]">
          Welcome, Navanagara
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/images/profile.webp"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-[14px] text-[#333]">
              {memberData?.name || "Member"}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7C66CA] text-[#7C66CA] text-[14px] font-semibold hover:bg-[#7C66CA] hover:text-white transition-colors duration-200"
          >
            <img src="/images/exit.svg" alt="Sign Out" className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="px-[50px] pt-[40px]">
        {/* Overview Cards — same style as dashboard */}
        <h2 className="font-semibold text-[20px] mb-6">Overview</h2>
        <div className="flex gap-6 mb-10 justify-start">
          {/* Total Amount */}
          <div className="bg-[#8356D6] rounded-2xl p-6 w-[260px] flex items-center gap-4">
            <div className="w-1 h-12 bg-yellow-400 rounded-full" />
            <div>
              <p className="text-white text-[16px] font-medium">Total Amount</p>
              <p className="text-white text-[28px] font-bold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Paid Amount */}
          <div className="bg-[#8356D6] rounded-2xl p-6 w-[260px] flex items-center gap-4">
            <div className="w-1 h-12 bg-green-400 rounded-full" />
            <div>
              <p className="text-white text-[16px] font-medium">Paid Amount</p>
              <p className="text-white text-[28px] font-bold">
                ₹{paidAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Pending Amount */}
          <div
            className={`rounded-2xl p-6 w-[260px] flex items-center gap-4 ${pendingAmount > 0 ? "bg-red-500" : "bg-[#8356D6]"}`}
          >
            <div className="w-1 h-12 bg-yellow-400 rounded-full" />
            <div>
              <p className="text-white text-[16px] font-medium">
                Remaining Amount
              </p>
              <p className="text-white text-[28px] font-bold">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <h2 className="font-semibold text-[24px] mb-4">My Receipts</h2>
      </div>

      <div className="w-75 px-[50px] pb-10">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#8356D6]">
                {tableHeaders.map((header, index) => (
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
              {receipts.map((receipt, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 text-start text-[14px] transition-colors duration-200 ${receipt.cancelled ? "bg-red-50" : "hover:bg-purple-50"}`}
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.date
                      ? new Date(receipt.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.receipt_no || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.transactionid || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {receipt.amountpaid
                      ? `₹${Number(receipt.amountpaid).toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(receipt)}
                        className="w-[110px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200"
                      >
                        View More
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(receipt)}
                        disabled={downloadingId === receipt._id}
                        className="w-[110px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        {downloadingId === receipt._id ? (
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
                      {receipt.cancelled && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {receipts.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No receipts found.
            </div>
          )}
        </div>
      </div>

      {/* View More Modal */}
      {isModalOpen && selectedReceipt && (
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
                <span className="font-medium">Back to Receipts</span>
              </button>
              {selectedReceipt.cancelled && (
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-full border border-red-300">
                  ✕ Cancelled
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6">
              <div
                className={`bg-white border rounded-2xl p-6 ${selectedReceipt.cancelled ? "border-red-300" : "border-gray-200"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-semibold">Receipt Details</h2>
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
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
                        {selectedReceipt.name || "-"}
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
                        {selectedReceipt.seniority_no || "-"}
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
                        {selectedReceipt.mobilenumber || "-"}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* Details grid */}
                <dl className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {[
                    ["Receipt No.", selectedReceipt.receipt_no],
                    ["Transaction ID", selectedReceipt.transactionid],
                    [
                      "Receipt Date",
                      selectedReceipt.date
                        ? new Date(selectedReceipt.date).toLocaleDateString()
                        : "-",
                    ],
                    ["Project Name", selectedReceipt.projectname],
                    ["Site Dimension", selectedReceipt.sitedimension],
                    ["Payment Type", selectedReceipt.paymenttype],
                    ["Payment Mode", selectedReceipt.paymentmode],
                    ["Bank", selectedReceipt.bank],
                    [
                      "Amount Paid",
                      selectedReceipt.amountpaid
                        ? `₹${Number(selectedReceipt.amountpaid).toLocaleString("en-IN")}`
                        : "-",
                    ],
                    [
                      "Total Received",
                      selectedReceipt.totalreceived
                        ? `₹${Number(selectedReceipt.totalreceived).toLocaleString("en-IN")}`
                        : "-",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-gray-200 pb-4">
                      <dt className="inline font-semibold">{label}: </dt>
                      <dd className="inline font-normal">{value || "-"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

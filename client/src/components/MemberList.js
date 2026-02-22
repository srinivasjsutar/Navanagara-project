import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "./Header";

export function MemberList() {
  const isSuperAdmin = !!localStorage.getItem("superAdminToken");

  const headers = [
    "Date",
    "Member Name",
    "Seniority No",
    "Membership Type",
    "",
  ];
  const [Memberdetails, SetMemberDetails] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:3001/members")
      .then((response) => {
        SetMemberDetails(response.data.data || []);
      })
      .catch((err) => console.error("Unable to fetch the data", err));
  }, []);

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
        `http://localhost:3001/members/${selectedMember._id}`,
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
      setSelectedMember(editData);
      setIsEditing(false);
      alert("Member updated successfully!");
    } catch (err) {
      console.error("Error updating member", err);
      alert("Failed to update member.");
    }
  };

  const field = (label, name, value) => (
    <div className="border-b border-gray-200 pb-4">
      <dt className="inline font-semibold">{label}: </dt>
      {isEditing ? (
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
      <div className="px-[50px] pt-[50px] font-semibold text-[24px]">
        All Member List
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
              {Memberdetails.map((member, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-200 text-start text-[14px] hover:bg-purple-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.date
                      ? new Date(member.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.seniority_no || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {member.membershiptype || "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(member)}
                      className="w-[170px] font-medium border-1 py-[6px] px-[10px] border-[#8356D6] rounded text-[14px] text-[#8356D6] hover:bg-[#8356D6] hover:text-white transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Memberdetails.length === 0 && (
            <div className="p-6 text-center text-red-600">Not found.</div>
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
                <span className="font-medium">Back to Member List</span>
              </button>

              {/* Edit/Save buttons - only for superadmin */}
              {isSuperAdmin && (
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

            <div className="px-6 pb-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-semibold">Member Details</h2>
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
                  <div className="flex items-center gap-1">
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
                  <div className="flex items-center gap-1">
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
                  <div className="flex items-center gap-1">
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
                        {selectedMember.mobile || "-"}
                      </dd>
                    </div>
                  </div>
                </dl>

                <dl className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {field(
                    "Application Number",
                    "applicationno",
                    selectedMember.applicationno,
                  )}
                  {field(
                    "Membership Type",
                    "membershiptype",
                    selectedMember.membershiptype,
                  )}
                  {field(
                    "Membership Day",
                    "membershipday",
                    selectedMember.membershipday,
                  )}
                  {field(
                    "Membership Fees",
                    "membershipfees",
                    selectedMember.membershipfees,
                  )}
                  {field("Email", "email", selectedMember.email)}
                  {field(
                    "DOB",
                    "dob",
                    selectedMember.dob
                      ? new Date(selectedMember.dob).toLocaleDateString()
                      : "-",
                  )}
                  {field(
                    "Adhar Number",
                    "aadharnumber",
                    selectedMember.aadharnumber,
                  )}
                  {field(
                    "Birth Place",
                    "birthplace",
                    selectedMember.birthplace,
                  )}
                  {field(
                    "Alternate Mobile Number",
                    "alternatemobile",
                    selectedMember.alternatemobile,
                  )}
                  {field(
                    "Alternate Email",
                    "alternateemail",
                    selectedMember.alternateemail,
                  )}
                  {field(
                    "Permanent Address",
                    "permanentaddress",
                    selectedMember.permanentaddress,
                  )}
                  {field(
                    "Correspondence Address",
                    "correspondenceaddress",
                    selectedMember.correspondenceaddress,
                  )}
                  {field(
                    "Nominee Name",
                    "nomineename",
                    selectedMember.nomineename,
                  )}
                  {field(
                    "Nominee Mobile Number",
                    "nomineenumber",
                    selectedMember.nomineenumber,
                  )}
                  {field(
                    "Nominee Age",
                    "nomineeage",
                    selectedMember.nomineeage,
                  )}
                  {field(
                    "Nominee Relationship",
                    "nomineerelationship",
                    selectedMember.nomineerelationship,
                  )}
                  <div className="border-b border-gray-200 pb-4 col-span-2">
                    <dt className="inline font-semibold">Nominee Address: </dt>
                    {isEditing ? (
                      <input
                        name="nomineeaddress"
                        value={editData.nomineeaddress || ""}
                        onChange={handleEditChange}
                        className="border border-gray-300 rounded px-2 py-1 text-sm ml-1 w-full mt-1"
                      />
                    ) : (
                      <dd className="inline font-normal">
                        {selectedMember.nomineeaddress || "-"}
                      </dd>
                    )}
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

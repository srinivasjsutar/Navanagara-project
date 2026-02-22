import { useFormik } from "formik";
import * as yup from "yup";
import { Header } from "./Header";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const extractMessage = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object")
    return data.message || data.error || data.msg || JSON.stringify(data);
  return String(data);
};

export function SiteBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [seniorityInput, setSeniorityInput] = useState("");
  const [fullSeniorityNo, setFullSeniorityNo] = useState("");
  const [isFetchingMember, setIsFetchingMember] = useState(false);
  const [memberFound, setMemberFound] = useState(false);
  const [familyParticulars, setFamilyParticulars] = useState([
    { name: "", age: "", relationship: "" },
  ]);

  const projects = [
    { name: "New City", code: "NCG" },
    { name: "New City 1", code: "NCS" },
  ];

  const formik = useFormik({
    initialValues: {
      Name: "",
      Date: "",
      ProjectName: "",
      SiteDimension: "",
      TotalAmount: "",
      Designation: "",
      SeniorityNo: "",
    },
    validationSchema: yup.object({
      Name: yup
        .string()
        .required("Name is required")
        .min(3, "Minimum 3 characters required")
        .max(50, "Maximum 50 characters required")
        .matches(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),
      Date: yup.date().required("Date is required"),
      ProjectName: yup.string().required("Project Name is required"),
      SiteDimension: yup.string().required("Site Dimension is required"),
      TotalAmount: yup
        .number()
        .required("Total amount is required")
        .positive("Amount must be greater than 0"),
      // Designation is now optional
      Designation: yup.string().optional(),
      SeniorityNo: yup
        .string()
        .required("Seniority number required")
        .matches(/^[A-Z]{2,3}-\d{3,4}$/, "Invalid format (e.g., NCG-001)"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm }) => {
      // Family particulars: only validate rows where at least one field is filled
      for (let i = 0; i < familyParticulars.length; i++) {
        const fp = familyParticulars[i];
        const anyFilled =
          fp.name.trim() || fp.age.toString().trim() || fp.relationship.trim();
        // If any field is partially filled, require all fields in that row
        if (
          anyFilled &&
          (!fp.name.trim() ||
            !fp.age.toString().trim() ||
            !fp.relationship.trim())
        ) {
          toast.error(
            `Please fill all fields for Family Member ${i + 1} or leave the row empty`,
          );
          return;
        }
      }

      setIsSubmitting(true);
      setSubmitMessage("");
      try {
        // Filter out completely empty rows before submitting
        const filteredFamilyParticulars = familyParticulars.filter(
          (fp) =>
            fp.name.trim() ||
            fp.age.toString().trim() ||
            fp.relationship.trim(),
        );

        const payload = {
          name: values.Name,
          date: values.Date,
          projectname: values.ProjectName,
          sitedimension: values.SiteDimension,
          totalamount: Number(values.TotalAmount),
          designation: values.Designation,
          seniority_no: values.SeniorityNo,
          nominees: filteredFamilyParticulars,
        };

        const response = await axios.post(
          "http://localhost:3001/site-booking",
          payload,
        );
        setSubmitMessage(
          extractMessage(response.data) || "Site booking created successfully!",
        );
        toast.success("Site booking created successfully!");
        resetForm();
        setSeniorityInput("");
        setFullSeniorityNo("");
        setMemberFound(false);
        setFamilyParticulars([{ name: "", age: "", relationship: "" }]);
      } catch (error) {
        console.error("Error submitting form:", error);
        if (error.response) {
          const errMsg =
            extractMessage(error.response.data) || "An error occurred.";
          setSubmitMessage(errMsg);
          toast.error(`Error: ${errMsg}`);
        } else if (error.request) {
          setSubmitMessage("No response from server.");
          toast.error("No response from server.");
        } else {
          setSubmitMessage("An error occurred while submitting the form.");
          toast.error("An error occurred while submitting the form.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.ProjectName && seniorityInput) {
      const selectedProject = projects.find(
        (p) => p.name === formik.values.ProjectName,
      );
      if (selectedProject) {
        const paddedNumber = seniorityInput.padStart(3, "0");
        const fullNumber = `${selectedProject.code}-${paddedNumber}`;
        setFullSeniorityNo(fullNumber);
        formik.setFieldValue("SeniorityNo", fullNumber);
        fetchMemberDetails(fullNumber);
      }
    } else {
      setFullSeniorityNo("");
      formik.setFieldValue("SeniorityNo", "");
      setMemberFound(false);
    }
  }, [formik.values.ProjectName, seniorityInput]);

  const fetchMemberDetails = async (seniorityNo) => {
    setIsFetchingMember(true);
    setMemberFound(false);
    try {
      const response = await axios.get("http://localhost:3001/members");
      const members = response.data.data || [];
      const member = members.find((m) => m.seniority_no === seniorityNo);
      if (member) {
        formik.setFieldValue("Name", member.name || "");
        const project = projects.find((p) => seniorityNo.startsWith(p.code));
        if (project) formik.setFieldValue("ProjectName", project.name);
        setMemberFound(true);
        setSubmitMessage("Member found! Name and Project auto-filled.");
      } else {
        setMemberFound(false);
        setSubmitMessage("Member not found with this seniority number.");
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      setSubmitMessage("Error fetching member details.");
    } finally {
      setIsFetchingMember(false);
    }
  };

  const handleSeniorityInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setSeniorityInput(value);
  };

  const handleFamilyChange = (index, field, value) => {
    setFamilyParticulars((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addFamilyMember = () => {
    if (familyParticulars.length < 5) {
      setFamilyParticulars((prev) => [
        ...prev,
        { name: "", age: "", relationship: "" },
      ]);
    }
  };

  const removeFamilyMember = (index) => {
    if (familyParticulars.length > 1) {
      setFamilyParticulars((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const isErrorMessage =
    typeof submitMessage === "string" &&
    (submitMessage.includes("Error") ||
      submitMessage.includes("error") ||
      submitMessage.includes("not found"));

  return (
    <div>
      <Header />
      <div className="w-[791px] px-10 ml-10">
        <h1 className="font-semibold text-2xl mt-[50px] mb-[40px]">
          Site Booking
        </h1>

        {submitMessage && (
          <div
            className={`p-4 mb-4 rounded ${isErrorMessage ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {submitMessage}
          </div>
        )}

        <form
          className="bg-[#FAF9FF] p-[30px] rounded-xl"
          onSubmit={formik.handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <select
                name="ProjectName"
                onChange={formik.handleChange}
                value={formik.values.ProjectName}
                disabled={memberFound}
                className="border border-gray-200 w-full p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.code} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
              {formik.touched.ProjectName && formik.errors.ProjectName && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.ProjectName}
                </div>
              )}
            </div>

            {/* Seniority Number */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Seniority Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter number (e.g., 001)"
                value={seniorityInput}
                onChange={handleSeniorityInputChange}
                disabled={!formik.values.ProjectName}
                maxLength="4"
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {fullSeniorityNo && (
                <div
                  className={`text-sm mt-1 font-semibold ${memberFound ? "text-green-600" : "text-blue-600"}`}
                >
                  {isFetchingMember
                    ? "Checking..."
                    : `Generated: ${fullSeniorityNo}`}
                </div>
              )}
              {formik.touched.SeniorityNo && formik.errors.SeniorityNo && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.SeniorityNo}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Name"
                value={formik.values.Name}
                onChange={formik.handleChange}
                placeholder="Enter Your Name"
                disabled={memberFound}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {formik.touched.Name && formik.errors.Name && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.Name}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="Date"
                value={formik.values.Date}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.Date && formik.errors.Date && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.Date}
                </div>
              )}
            </div>

            {/* Site Dimension */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Site Dimension <span className="text-red-500">*</span>
              </label>
              <select
                name="SiteDimension"
                onChange={formik.handleChange}
                value={formik.values.SiteDimension}
                className="border border-gray-200 w-full p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              >
                <option value="">Select Dimension</option>
                {["20x30", "30x40", "30x50", "40x60", "50x80"].map((dim) => (
                  <option key={dim} value={dim}>
                    {dim}
                  </option>
                ))}
              </select>
              {formik.touched.SiteDimension && formik.errors.SiteDimension && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.SiteDimension}
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="TotalAmount"
                placeholder="5,00,000"
                value={formik.values.TotalAmount}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.TotalAmount && formik.errors.TotalAmount && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.TotalAmount}
                </div>
              )}
            </div>

            {/* Designation (optional) */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Designation
              </label>
              <input
                type="text"
                name="Designation"
                placeholder="Enter Designation"
                value={formik.values.Designation}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.Designation && formik.errors.Designation && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.Designation}
                </div>
              )}
            </div>
          </div>

          {/* ── Family Particulars Section ── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[14px]">
                Family Particulars
                <span className="text-gray-400 font-normal text-xs ml-2">
                  (optional, max 5)
                </span>
              </h3>
              {familyParticulars.length < 5 && (
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="text-[#7158B6] text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="text-lg leading-none">+</span> Add Member
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {familyParticulars.map((fp, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#7158B6]">
                      Member {index + 1}
                    </span>
                    {familyParticulars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="text-red-400 hover:text-red-600 text-sm font-medium"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Member name"
                        value={fp.name}
                        onChange={(e) =>
                          handleFamilyChange(index, "name", e.target.value)
                        }
                        className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="Age"
                        value={fp.age}
                        min="1"
                        max="120"
                        onChange={(e) =>
                          handleFamilyChange(index, "age", e.target.value)
                        }
                        className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Relationship
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Son, Wife"
                        value={fp.relationship}
                        onChange={(e) =>
                          handleFamilyChange(
                            index,
                            "relationship",
                            e.target.value,
                          )
                        }
                        className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[2.5px] text-gray-400 mt-8">
            <hr />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-[#FFFF00] via-[#7158B6] to-[#7158B6] text-white font-bold px-8 py-2.5 rounded-full shadow-lg w-[150px] ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

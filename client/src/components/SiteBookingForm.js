import { useFormik } from "formik";
import * as yup from "yup";
import { Header } from "./Header";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Helper: safely extract a string message from any response shape
const extractMessage = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    return data.message || data.error || data.msg || JSON.stringify(data);
  }
  return String(data);
};

export function SiteBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [seniorityInput, setSeniorityInput] = useState("");
  const [fullSeniorityNo, setFullSeniorityNo] = useState("");
  const [isFetchingMember, setIsFetchingMember] = useState(false);
  const [memberFound, setMemberFound] = useState(false);

  // Define project list with their codes
  const projects = [
    { name: "New City", code: "NCG" },
    { name: "New City 1", code: "NCS" },
    // Add more projects as needed
  ];

  const formik = useFormik({
    initialValues: {
      Name: "",
      Date: "",
      ProjectName: "",
      SiteDimension: "",
      TransactionId: "",
      TotalAmount: "",
      BookingAmount: "",
      DownPayment: "",
      PaymentMode: "",
      Bank: "",
      SeniorityNo: "",
    },
    validationSchema: yup.object({
      Name: yup
        .string()
        .required("Name is required ")
        .min(3, "minimum 3 characters required")
        .max(50, "maximum 50 characters required")
        .matches(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),

      Date: yup.date().required("Date is required"),

      ProjectName: yup.string().required("Project Name is required"),

      SiteDimension: yup
        .string()
        .required("Site Dimension is required")
        .matches(
          /^[1-9]\d*\s*x\s*[1-9]\d*$/i,
          "Enter valid dimension (Example: 30x50)",
        ),

      TransactionId: yup.string().required("Transaction ID is required"),

      TotalAmount: yup
        .number()
        .required("Total amount is required")
        .positive("Amount must be greater than 0"),

      BookingAmount: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value,
        )
        .optional()
        .nullable(),

      DownPayment: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value,
        )
        .optional()
        .nullable(),

      PaymentMode: yup
        .string()
        .required("Payment mode is required")
        .oneOf(["Cash", "Cheque", "UPI"], "Select valid payment mode"),

      Bank: yup
        .string()
        .required("Bank name is required")
        .min(2, "Minimum 2 characters required"),

      SeniorityNo: yup
        .string()
        .required("Seniority number required")
        .matches(/^[A-Z]{2,3}-\d{3,4}$/, "Invalid format (e.g., NCG-001)"),
    }),

    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      setSubmitMessage("");

      try {
        const payload = {
          name: values.Name,
          date: values.Date,
          projectname: values.ProjectName,
          sitedimension: values.SiteDimension,
          transactionid: values.TransactionId,
          totalamount: Number(values.TotalAmount),
          paymentmode: values.PaymentMode,
          bank: values.Bank,
          seniority_no: values.SeniorityNo,
        };

        if (
          values.BookingAmount !== "" &&
          values.BookingAmount !== undefined &&
          values.BookingAmount !== null
        ) {
          payload.bookingamount = Number(values.BookingAmount);
        }
        if (
          values.DownPayment !== "" &&
          values.DownPayment !== undefined &&
          values.DownPayment !== null
        ) {
          payload.downpayment = Number(values.DownPayment);
        }

        const response = await axios.post(
          "http://localhost:3001/site-booking",
          payload,
        );

        // FIX: Always extract a plain string from response.data (was crashing when data was an object)
        const successMsg =
          extractMessage(response.data) || "Site booking created successfully!";
        setSubmitMessage(successMsg);
        toast.success("Site booking created successfully!");
        resetForm();
        setSeniorityInput("");
        setFullSeniorityNo("");
        setMemberFound(false);
      } catch (error) {
        console.error("Error submitting form:", error);

        if (error.response) {
          // FIX: Always extract a plain string from error.response.data (was crashing when data was an object)
          const errMsg =
            extractMessage(error.response.data) || "An error occurred.";
          setSubmitMessage(errMsg);
          toast.error(`Error: ${errMsg}`);
        } else if (error.request) {
          setSubmitMessage(
            "No response from server. Please check if the server is running.",
          );
          toast.error(
            "No response from server. Please check if the server is running.",
          );
        } else {
          setSubmitMessage("An error occurred while submitting the form.");
          toast.error("An error occurred while submitting the form.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update the full seniority number when project or seniority input changes
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

  // Fetch member details from backend
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
        if (project) {
          formik.setFieldValue("ProjectName", project.name);
        }

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

  // FIX: Safe string check — submitMessage is always a string now, but guard anyway
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

        {/* FIX: submitMessage is always a string; safe to call .includes() now */}
        {submitMessage && (
          <div
            className={`p-4 mb-4 rounded ${
              isErrorMessage
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter number (e.g., 001)"
                  value={seniorityInput}
                  onChange={handleSeniorityInputChange}
                  disabled={!formik.values.ProjectName}
                  maxLength="4"
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
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

            {/* Name - Auto-filled */}
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

            <div>
              <label className="font-semibold text-[14px] pb-1">
                Site Dimension <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="SiteDimension"
                placeholder="30x40"
                onChange={formik.handleChange}
                value={formik.values.SiteDimension}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.SiteDimension && formik.errors.SiteDimension && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.SiteDimension}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-[14px] pb-1">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="TransactionId"
                placeholder="123465"
                onChange={formik.handleChange}
                value={formik.values.TransactionId}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.TransactionId && formik.errors.TransactionId && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.TransactionId}
                </div>
              )}
            </div>

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

            {/* Booking Amount - Optional */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Booking Amount
                <span className="text-gray-400 text-xs ml-1">(optional)</span>
              </label>
              <input
                type="number"
                name="BookingAmount"
                placeholder="1,50,000"
                value={formik.values.BookingAmount}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.BookingAmount && formik.errors.BookingAmount && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.BookingAmount}
                </div>
              )}
            </div>

            {/* Down Payment - Optional */}
            <div>
              <label className="font-semibold text-[14px] pb-1">
                Down Payment
                <span className="text-gray-400 text-xs ml-1">(optional)</span>
              </label>
              <input
                type="number"
                name="DownPayment"
                placeholder="50,000"
                value={formik.values.DownPayment}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.DownPayment && formik.errors.DownPayment && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.DownPayment}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-[14px] pb-1">
                Payment Mode <span className="text-red-400">*</span>
              </label>
              <select
                name="PaymentMode"
                onChange={formik.handleChange}
                value={formik.values.PaymentMode}
                className="border border-gray-200 w-full p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              >
                <option value="">Select</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
              {formik.touched.PaymentMode && formik.errors.PaymentMode && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.PaymentMode}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-[14px] pb-1">
                Bank <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Bank"
                placeholder="Enter Bank Name"
                value={formik.values.Bank}
                onChange={formik.handleChange}
                className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              />
              {formik.touched.Bank && formik.errors.Bank && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.Bank}
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-[2.5px] text-gray-400 mt-8">
            <hr />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-[#FFFF00] via-[#7158B6] to-[#7158B6] text-white font-bold px-8 py-2.5 rounded-full shadow-lg w-[150px] ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

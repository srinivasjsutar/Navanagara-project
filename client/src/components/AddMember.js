import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { Header } from "./Header";
import { toast } from "react-toastify";

const AddMember = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [seniorityInput, setSeniorityInput] = useState("");
  const [fullSeniorityNo, setFullSeniorityNo] = useState("");

  // Define project list with their codes
  const projects = [
    { name: "New City", code: "NCG" },
    { name: "New City 1", code: "NCS" },
    // Add more projects as needed
  ];

  // Formik for Step 1 - Membership Details
  const formikStep1 = useFormik({
    initialValues: {
      Name: "",
      ProjectName: "",
      SeniorityNo: "",
      MembershipType: "",
      ApplicationNumber: "",
      MembershipDay: "",
      MembershipFees: "",
      MobileNumber: "",
      Email: "",
      Image: null,
    },
    validationSchema: yup.object({
      Name: yup
        .string()
        .required("Name is required")
        .min(3, "Minimum 3 characters required")
        .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
      ProjectName: yup.string().required("Project Name is required"),
      SeniorityNo: yup
        .string()
        .required("Seniority number required")
        .matches(/^[A-Z]{2,3}-\d{3,4}$/, "Invalid format (e.g., NCG-001)"),
      MembershipType: yup.string().required("Membership type is required"),
      ApplicationNumber: yup.string().required("Application number is required"),
      MembershipDay: yup
        .date()
        .required("Membership day is required")
        .typeError("Please select a valid date"),
      MembershipFees: yup
        .number()
        .required("Membership fees is required")
        .positive("Must be greater than 0"),
      MobileNumber: yup
        .string()
        .required("Mobile number is required")
        .matches(/^(\+91|0)?[6-9]\d{9}$/, "Enter valid 10-digit number"),
      Email: yup.string().required("Email is required").email("Enter valid email"),
      Image: yup.mixed().nullable().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Step 1:", values);
      setCurrentStep(2);
    },
  });

  // Update the full seniority number when project or seniority input changes
  useEffect(() => {
    if (formikStep1.values.ProjectName && seniorityInput) {
      const selectedProject = projects.find(
        (p) => p.name === formikStep1.values.ProjectName
      );
      if (selectedProject) {
        const paddedNumber = seniorityInput.padStart(3, "0");
        const fullNumber = `${selectedProject.code}-${paddedNumber}`;
        setFullSeniorityNo(fullNumber);
        formikStep1.setFieldValue("SeniorityNo", fullNumber);
      }
    } else {
      setFullSeniorityNo("");
      formikStep1.setFieldValue("SeniorityNo", "");
    }
  }, [formikStep1.values.ProjectName, seniorityInput]);

  const handleSeniorityInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setSeniorityInput(value);
  };

  // Formik for Step 2 - Personal Details
  const formikStep2 = useFormik({
    initialValues: {
      AadharNumber: "",
      DOB: "",
      FatherName: "",
      BirthPlace: "",
      AlternateMobileNumber: "",
      AlternateEmail: "",
      PermanentAddress: "",
      CorrespondenceAddress: "",
      PanCard: null,
      AadharCard: null,
      ApplicationDoc: null,
    },
    validationSchema: yup.object({
      AadharNumber: yup
        .string()
        .required("Aadhar number is required")
        .matches(/^\d{4}\s?\d{4}\s?\d{4}$/, "Enter valid 12-digit Aadhar number"),
      DOB: yup
        .date()
        .required("Date of birth is required")
        .max(new Date(), "Future date not allowed")
        .typeError("Please select valid date"),
      FatherName: yup
        .string()
        .required("Father name is required")
        .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
      BirthPlace: yup
        .string()
        .required("Birth place is required")
        .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
      AlternateMobileNumber: yup
        .string()
        .required("Alternate mobile number is required")
        .matches(/^(\+91|0)?[6-9]\d{9}$/, "Enter valid 10-digit number"),
      AlternateEmail: yup
        .string()
        .required("Alternate email is required")
        .email("Enter valid email"),
      PermanentAddress: yup
        .string()
        .required("Permanent address is required")
        .min(10, "Minimum 10 characters required"),
      CorrespondenceAddress: yup
        .string()
        .required("Correspondence address is required")
        .min(10, "Minimum 10 characters required"),
      PanCard: yup.mixed().nullable().notRequired(),
      AadharCard: yup.mixed().nullable().notRequired(),
      ApplicationDoc: yup.mixed().nullable().notRequired(),
    }),
    onSubmit: (values) => {
      console.log("Step 2:", values);
      setCurrentStep(3);
    },
  });

  // Formik for Step 3 - Nominee Details
  const formikStep3 = useFormik({
    initialValues: {
      NomineeName: "",
      NomineeMobileNumber: "",
      NomineeAge: "",
      NomineeRelationship: "",
      NomineeAddress: "",
      AgreeTermsConditions: false,
      AgreeCommunication: false,
    },
    validationSchema: yup.object({
      NomineeName: yup
        .string()
        .required("Nominee name is required")
        .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
      NomineeMobileNumber: yup
        .string()
        .required("Nominee mobile number is required")
        .matches(/^(\+91|0)?[6-9]\d{9}$/, "Enter valid 10-digit number"),
      NomineeAge: yup
        .number()
        .required("Nominee age is required")
        .positive("Must be greater than 0")
        .integer("No decimals allowed")
        .min(18, "Nominee must be at least 18 years old")
        .max(100, "Invalid age"),
      NomineeRelationship: yup
        .string()
        .required("Nominee relationship is required")
        .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
      NomineeAddress: yup
        .string()
        .required("Nominee address is required")
        .min(10, "Minimum 10 characters required"),
      AgreeTermsConditions: yup
        .boolean()
        .oneOf([true], "You must agree to terms and conditions"),
      AgreeCommunication: yup
        .boolean()
        .oneOf([true], "You must agree to communications"),
    }),
    onSubmit: async (values) => {
      console.log("Step 3:", values);
      console.log("All Steps Completed!");

      const finalData = {
        name: formikStep1.values.Name,
        seniority_no: formikStep1.values.SeniorityNo,
        membershiptype: formikStep1.values.MembershipType,
        applicationno: String(formikStep1.values.ApplicationNumber),
        date: new Date(),
        membershipday: formikStep1.values.MembershipDay,
        membershipfees: String(formikStep1.values.MembershipFees),
        mobile: String(formikStep1.values.MobileNumber),
        email: formikStep1.values.Email,

        aadharnumber: formikStep2.values.AadharNumber.replace(/\s/g, ""),
        dob: formikStep2.values.DOB,
        father: formikStep2.values.FatherName,
        birthplace: formikStep2.values.BirthPlace,
        alternatemobile: String(formikStep2.values.AlternateMobileNumber),
        alternateemail: formikStep2.values.AlternateEmail,
        permanentaddress: formikStep2.values.PermanentAddress,
        correspondenceaddress: formikStep2.values.CorrespondenceAddress,

        nomineename: values.NomineeName,
        nomineenumber: String(values.NomineeMobileNumber),
        nomineeage: String(values.NomineeAge),
        nomineerelationship: values.NomineeRelationship,
        nomineeaddress: values.NomineeAddress,
        agreetermsconditions: values.AgreeTermsConditions,
        agreecommunication: values.AgreeCommunication,
      };

      console.log("Final Data to send:", finalData);

      try {
        const formData = new FormData();
        // Append all text fields
        Object.entries(finalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
        // Append files if provided
        if (formikStep1.values.Image) {
          formData.append("Image", formikStep1.values.Image);
        }
        if (formikStep2.values.PanCard) {
          formData.append("PanCard", formikStep2.values.PanCard);
        }
        if (formikStep2.values.AadharCard) {
          formData.append("AadharCard", formikStep2.values.AadharCard);
        }
        if (formikStep2.values.ApplicationDoc) {
          formData.append("ApplicationDoc", formikStep2.values.ApplicationDoc);
        }

        const response = await axios.post(
          "http://localhost:3001/add-members",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Member added successfully:", response.data);
        toast.success("Member added successfully!");
        formikStep1.resetForm();
        formikStep2.resetForm();
        formikStep3.resetForm();
        setSeniorityInput("");
        setFullSeniorityNo("");
        setIsFormCompleted(false);
        setCurrentStep(1);
      } catch (error) {
        console.error("Error saving member:", error);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error("Error adding member. Please try again.");
        }
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) formikStep1.setFieldValue("Image", file);
  };

  const handleFileChange = (fieldName) => (e) => {
    const file = e.target.files[0];
    if (file) formikStep2.setFieldValue(fieldName, file);
  };

  // Reusable file upload field component
  const FileUploadField = ({ label, fieldName, accept = "image/*,.pdf", formik }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <input
        type="file"
        id={fieldName}
        accept={accept}
        onChange={handleFileChange(fieldName)}
        className="hidden"
      />
      <label
        htmlFor={fieldName}
        className="flex items-center justify-between gap-3 border border-gray-300 px-4 py-2.5 w-full bg-white rounded text-sm cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
      >
        <span className={formik.values[fieldName] ? "text-gray-700 truncate" : "text-gray-400"}>
          {formik.values[fieldName] ? formik.values[fieldName].name : `Upload ${label}`}
        </span>
        <img src="/images/upload.svg" alt="upload" className="w-5 h-5 flex-shrink-0" />
      </label>
      {formik.values[fieldName] && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-green-600 text-xs">✓ File selected</span>
          <button
            type="button"
            onClick={() => formik.setFieldValue(fieldName, null)}
            className="text-red-400 text-xs hover:text-red-600"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div>
      <Header />
      <div className="w-full min-h-screen pl-20 mb-10">
        <div className="w-full max-w-4xl">
          <h1 className="font-semibold text-2xl pt-[50px] pb-[40px]">
            Add Member Form
          </h1>

          {/* PROGRESS STEPPER */}
          <div className="mb-12 relative max-w-[602px]">
            <div className="absolute w-[502px] top-6 left-12 right-0 h-[2px] bg-[#C9BFF0]" />
            <div
              className="absolute top-6 left-0 h-[2px] bg-[#7C66CA] transition-all duration-500"
              style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "0%" : "0%" }}
            />
            <div className="flex justify-between relative z-10">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 1 ? "bg-[#7C66CA] text-white" : "bg-[#C9BFF0] text-white"}`}>
                  {isFormCompleted || currentStep > 1 ? "✓" : "1"}
                </div>
                <span className="text-sm mt-2 font-semibold text-dark">Membership Details</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 2 ? "bg-[#7C66CA] text-white" : "bg-[#C9BFF0] text-white"}`}>
                  {isFormCompleted || currentStep > 2 ? "✓" : "2"}
                </div>
                <span className="text-sm mt-2 font-semibold text-dark">Personal Details</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${currentStep >= 3 ? "bg-[#7C66CA] text-white" : "bg-[#C9BFF0] text-white"}`}>
                  {isFormCompleted ? "✓" : "3"}
                </div>
                <span className="text-sm mt-2 font-semibold text-dark">Nominee Details</span>
              </div>
            </div>
          </div>

          {/* Step 1 - Membership Details */}
          {currentStep === 1 && (
            <form onSubmit={formikStep1.handleSubmit} className="bg-[#FAF9FF] rounded-xl p-[30px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="Name" onChange={formikStep1.handleChange} onBlur={formikStep1.handleBlur}
                    value={formikStep1.values.Name} placeholder="Varun"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.Name && formikStep1.errors.Name && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.Name}</div>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <select name="ProjectName" onChange={formikStep1.handleChange} onBlur={formikStep1.handleBlur}
                    value={formikStep1.values.ProjectName}
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm">
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.code} value={project.name}>{project.name}</option>
                    ))}
                  </select>
                  {formikStep1.touched.ProjectName && formikStep1.errors.ProjectName && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.ProjectName}</div>
                  )}
                </div>

                {/* Seniority Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Seniority No <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Enter number (e.g., 001)" value={seniorityInput}
                    onChange={handleSeniorityInputChange} onBlur={formikStep1.handleBlur}
                    disabled={!formikStep1.values.ProjectName} maxLength="4"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" />
                  {fullSeniorityNo && (
                    <div className="text-green-600 text-sm mt-1 font-semibold">Generated: {fullSeniorityNo}</div>
                  )}
                  {formikStep1.touched.SeniorityNo && formikStep1.errors.SeniorityNo && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.SeniorityNo}</div>
                  )}
                </div>

                {/* Membership Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Membership Type <span className="text-red-500">*</span>
                  </label>
                  <select name="MembershipType" onChange={formikStep1.handleChange} onBlur={formikStep1.handleBlur}
                    value={formikStep1.values.MembershipType}
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm">
                    <option value="">Select Membership Type</option>
                    <option value="Membership">Membership</option>
                  </select>
                  {formikStep1.touched.MembershipType && formikStep1.errors.MembershipType && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.MembershipType}</div>
                  )}
                </div>

                {/* Application Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Application Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="ApplicationNumber" onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur} value={formikStep1.values.ApplicationNumber}
                    placeholder="APP123456"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.ApplicationNumber && formikStep1.errors.ApplicationNumber && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.ApplicationNumber}</div>
                  )}
                </div>

                {/* Membership Day */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Membership Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" name="MembershipDay" onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur} value={formikStep1.values.MembershipDay}
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.MembershipDay && formikStep1.errors.MembershipDay && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.MembershipDay}</div>
                  )}
                </div>

                {/* Membership Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Membership Fees <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="MembershipFees" onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur} value={formikStep1.values.MembershipFees} placeholder="5000"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.MembershipFees && formikStep1.errors.MembershipFees && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.MembershipFees}</div>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="MobileNumber" onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur} value={formikStep1.values.MobileNumber} placeholder="9876543210"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.MobileNumber && formikStep1.errors.MobileNumber && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.MobileNumber}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="Email" onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur} value={formikStep1.values.Email}
                    placeholder="varun@example.com"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep1.touched.Email && formikStep1.errors.Email && (
                    <div className="text-red-500 text-xs mt-1">{formikStep1.errors.Email}</div>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Image</label>
                  <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange}
                    onBlur={formikStep1.handleBlur} className="hidden" />
                  <label htmlFor="imageUpload"
                    className="flex items-center justify-between gap-3 border border-gray-300 px-4 py-2.5 w-full bg-white rounded text-sm cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                    <span className={formikStep1.values.Image ? "text-gray-700 truncate" : "text-gray-400"}>
                      {formikStep1.values.Image ? formikStep1.values.Image.name : "Upload Image"}
                    </span>
                    <img src="/images/upload.svg" alt="upload" />
                  </label>
                  {formikStep1.values.Image && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-green-600 text-xs">✓ File selected</span>
                      <button type="button" onClick={() => formikStep1.setFieldValue("Image", null)}
                        className="text-red-400 text-xs hover:text-red-600">Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button type="submit"
                  className="bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 hover:opacity-90 text-white font-semibold px-12 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
                  Next
                </button>
              </div>
            </form>
          )}

          {/* Step 2 - Personal Details */}
          {currentStep === 2 && (
            <form onSubmit={formikStep2.handleSubmit} className="bg-[#FAF9FF] rounded-xl p-[30px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Aadhar Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Aadhar Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="AadharNumber" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.AadharNumber}
                    placeholder="1234 5678 9012"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.AadharNumber && formikStep2.errors.AadharNumber && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.AadharNumber}</div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input type="date" name="DOB" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.DOB}
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.DOB && formikStep2.errors.DOB && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.DOB}</div>
                  )}
                </div>

                {/* Father Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Father Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="FatherName" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.FatherName}
                    placeholder="Rajesh Kumar"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.FatherName && formikStep2.errors.FatherName && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.FatherName}</div>
                  )}
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Birth Place <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="BirthPlace" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.BirthPlace} placeholder="Chennai"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.BirthPlace && formikStep2.errors.BirthPlace && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.BirthPlace}</div>
                  )}
                </div>

                {/* Alternate Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Alternate Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="AlternateMobileNumber" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.AlternateMobileNumber}
                    placeholder="9876543210"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.AlternateMobileNumber && formikStep2.errors.AlternateMobileNumber && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.AlternateMobileNumber}</div>
                  )}
                </div>

                {/* Alternate Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Alternate Email <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="AlternateEmail" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.AlternateEmail}
                    placeholder="alternate@example.com"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.AlternateEmail && formikStep2.errors.AlternateEmail && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.AlternateEmail}</div>
                  )}
                </div>

                {/* Permanent Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Permanent Address <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="PermanentAddress" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.PermanentAddress}
                    placeholder="Tamilnadu"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.PermanentAddress && formikStep2.errors.PermanentAddress && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.PermanentAddress}</div>
                  )}
                </div>

                {/* Correspondence Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Correspondence Address <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="CorrespondenceAddress" onChange={formikStep2.handleChange}
                    onBlur={formikStep2.handleBlur} value={formikStep2.values.CorrespondenceAddress}
                    placeholder="Bangalore"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep2.touched.CorrespondenceAddress && formikStep2.errors.CorrespondenceAddress && (
                    <div className="text-red-500 text-xs mt-1">{formikStep2.errors.CorrespondenceAddress}</div>
                  )}
                </div>

                {/* ── NEW DOCUMENT UPLOAD FIELDS ── */}

                {/* PAN Card Upload */}
                <FileUploadField
                  label="PAN Card"
                  fieldName="PanCard"
                  accept="image/*,.pdf"
                  formik={formikStep2}
                />

                {/* Aadhar Card Upload */}
                <FileUploadField
                  label="Aadhar Card"
                  fieldName="AadharCard"
                  accept="image/*,.pdf"
                  formik={formikStep2}
                />

                {/* Application Upload - full width */}
                <div className="w-100">
                  <FileUploadField
                    label="Application Document"
                    fieldName="ApplicationDoc"
                    accept="image/*,.pdf"
                    formik={formikStep2}
                  />
                </div>

              </div>

              <div className="flex justify-end mt-8 gap-4">
                <button type="button" onClick={goToPreviousStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-12 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
                  Back
                </button>
                <button type="submit"
                  className="bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 hover:opacity-90 text-white font-semibold px-12 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
                  Next
                </button>
              </div>
            </form>
          )}

          {/* Step 3 - Nominee Details */}
          {currentStep === 3 && (
            <form onSubmit={formikStep3.handleSubmit} className="bg-[#FAF9FF] rounded-xl p-[30px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Nominee Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominee Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="NomineeName" onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur} value={formikStep3.values.NomineeName} placeholder="Varun"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep3.touched.NomineeName && formikStep3.errors.NomineeName && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.NomineeName}</div>
                  )}
                </div>

                {/* Nominee Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominee Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="NomineeMobileNumber" onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur} value={formikStep3.values.NomineeMobileNumber}
                    placeholder="8527419630"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep3.touched.NomineeMobileNumber && formikStep3.errors.NomineeMobileNumber && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.NomineeMobileNumber}</div>
                  )}
                </div>

                {/* Nominee Age */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominee Age <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="NomineeAge" onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur} value={formikStep3.values.NomineeAge} placeholder="35"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep3.touched.NomineeAge && formikStep3.errors.NomineeAge && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.NomineeAge}</div>
                  )}
                </div>

                {/* Nominee Relationship */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominee Relationship <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="NomineeRelationship" onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur} value={formikStep3.values.NomineeRelationship}
                    placeholder="Brother"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep3.touched.NomineeRelationship && formikStep3.errors.NomineeRelationship && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.NomineeRelationship}</div>
                  )}
                </div>

                {/* Nominee Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominee Address <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="NomineeAddress" onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur} value={formikStep3.values.NomineeAddress}
                    placeholder="Tamilnadu"
                    className="border border-gray-300 px-4 py-2.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent rounded text-sm" />
                  {formikStep3.touched.NomineeAddress && formikStep3.errors.NomineeAddress && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.NomineeAddress}</div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="AgreeTermsConditions" onChange={formikStep3.handleChange}
                      onBlur={formikStep3.handleBlur} checked={formikStep3.values.AgreeTermsConditions}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-400" />
                    <span className="text-sm text-gray-700">
                      I agree to the terms and conditions <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {formikStep3.touched.AgreeTermsConditions && formikStep3.errors.AgreeTermsConditions && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.AgreeTermsConditions}</div>
                  )}
                </div>

                {/* Communication */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="AgreeCommunication" onChange={formikStep3.handleChange}
                      onBlur={formikStep3.handleBlur} checked={formikStep3.values.AgreeCommunication}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-400" />
                    <span className="text-sm text-gray-700">
                      I agree to receive communications <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {formikStep3.touched.AgreeCommunication && formikStep3.errors.AgreeCommunication && (
                    <div className="text-red-500 text-xs mt-1">{formikStep3.errors.AgreeCommunication}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-4">
                <button type="button" onClick={goToPreviousStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-12 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
                  Back
                </button>
                <button type="submit"
                  className="bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 hover:opacity-90 text-white font-semibold px-12 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all uppercase text-sm tracking-wide">
                  Finish
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export { AddMember };
export default AddMember;
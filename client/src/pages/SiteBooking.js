import React from "react";
import { Formik, useFormik } from "formik";
import * as yup from "yup";

const SiteBooking = () => {
  const formik = useFormik({
    initialValues: {
      Name: "",
      MembershipId: "",
      ProjectName: "",
      SiteDimension: "",
      TransactionId: "",
      BookingAmount: "",
      DownPayment: "",
      PaymentMode: "",
      SeniorityNo: "",
    },
    validationSchema: yup.object({
      Name: yup
        .string()
        .required("Name is required")
        .min(3, "minimum 3 characters required")
        .max(10, "maximum 10 characters required")
        .matches(/^[A-Za-z]+([.\s][A-Za-z]+)*$/, "Enter valid name"),

      MembershipId: yup
        .number()
        .required("Membership ID is required")
        .integer("No decimal is allowed")
        .positive("must be grrater than 0")
        .max(999999, "too large Id"),

      ProjectName: yup
        .string()
        .required("Project Name is required")
        .min(3, "minimum 3 characters allowed")
        .max(10, "maximum 10characters allowed")
        .matches(/^[A-Za-z]+$/, "Only letters allowed"),

      SiteDimension: yup
        .string()
        .required("SiteDimension is required")
        .matches(
          /^[1-9]\d*\s*x\s*[1-9]\d*$/i,
          "Enter valid dimension (Example: 30x50)",
        ),

      TransactionId: yup
        .number()
        .required("Transaction ID is required")
        .integer("No decimal is allowed")
        .positive("must be grrater than 0")
        .max(999999454665, "too large Id"),

      BookingAmount: yup
        .number()
        .required("Booking amount is required")
        .positive("Amount must be greater than 0"),

      DownPayment: yup
        .number()
        .required("Booking amount is required")
        .positive("Amount must be greater than 0"),

      PaymentMode: yup
        .string()
        .required("Payment mode is required")
        .oneOf(["Cash", "Cheque", "UPI"], "Select valid payment mode"),

      SeniorityNo: yup
        .string()
        .required("Seniority number required")
        .min(3, "Minimum 3 characters required")
        .max(8, "Maximum 8 characters allowed")
        .matches(
          /^[A-Za-z0-9]+$/,
          "Only letters and numbers allowed (e.g., SN123654)",
        ),
    }),

    onSubmit: (values) => {
      alert("Successfully submitted");
    },
  });

  return (
    <>
      <div className="w-full mx-auto min-h-screen">
        <div className="w-full md:w-[50%] mx-auto">
          <h1 className="font-bold text-2xl my-6 ml-4">Site Booking</h1>

          <form
            className="bg-[#f6f3ff] shadow-gray-400 p-8 rounded-md m-4"
            onSubmit={formik.handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-bold">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formik.values.Name}
                  onChange={formik.handleChange}
                  placeholder="Enter Your Name"
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400   rounded-md"
                ></input>
                {formik.touched.Name && formik.errors.Name && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.Name}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Membership ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="MembershipId"
                  placeholder="1236546"
                  value={formik.values.MembershipId}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2  w-full   bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.MembershipId && formik.errors.MembershipId && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.MembershipId}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ProjectName"
                  placeholder="123465"
                  value={formik.values.ProjectName}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.ProjectName && formik.errors.ProjectName && (
                  <div className="text-red-500 text-sm mt-1">
                    {" "}
                    {formik.errors.ProjectName}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Site Dimension <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SiteDimension"
                  placeholder="30x40"
                  onChange={formik.handleChange}
                  value={formik.values.SiteDimension}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.SiteDimension &&
                  formik.errors.SiteDimension && (
                    <div className="text-red-500 text-sm mt-1">
                      {" "}
                      {formik.errors.SiteDimension}
                    </div>
                  )}
              </div>

              <div>
                <label className="font-bold">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="TransactionId"
                  placeholder="123465"
                  onChange={formik.handleChange}
                  value={formik.values.TransactionId}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.TransactionId &&
                  formik.errors.TransactionId && (
                    <div className="text-red-500 text-sm mt-1">
                      {" "}
                      {formik.errors.TransactionId}
                    </div>
                  )}
              </div>

              <div>
                <label className="font-bold">
                  Booking Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="BookingAmount"
                  placeholder="1,50,000"
                  value={formik.values.BookingAmount}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.BookingAmount &&
                  formik.errors.BookingAmount && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.BookingAmount}
                    </div>
                  )}
              </div>

              <div>
                <label className="font-bold">
                  Down Payment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="DownPayment"
                  placeholder="123465"
                  value={formik.values.DownPayment}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.DownPayment && formik.errors.DownPayment && (
                  <div className="text-red-500 text-sm mt-1">
                    {" "}
                    {formik.errors.DownPayment}
                  </div>
                )}
              </div>
              <div>
                <label className="font-bold">
                  Payment Mode <span className="text-red-400">*</span>
                </label>
                <select
                  name="PaymentMode"
                  onChange={formik.handleChange}
                  value={formik.values.PaymentMode}
                  className="border border-gray-200 w-full p-2  bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                >
                  <option>Select</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
                {formik.touched.PaymentMode && formik.errors.PaymentMode && (
                  <div className="text-red-500 text-sm mt-1">
                    {" "}
                    {formik.errors.PaymentMode}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Seniority No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SeniorityNo"
                  placeholder="123465"
                  value={formik.values.SeniorityNo}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                ></input>
                {formik.touched.SeniorityNo && formik.errors.SeniorityNo && (
                  <div className="text-red-500 text-sm mt-1">
                    {" "}
                    {formik.errors.SeniorityNo}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full h-[2.5px] text-gray-400 mt-8">
              <hr></hr>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 hover:bg-gray-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-shadow hover:text-black w-[150px]"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SiteBooking;

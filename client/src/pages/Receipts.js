import { Formik, useFormik } from "formik";
import * as yup from "yup";

export function Receipt (){
  const formik = useFormik({
    initialValues: {
      Name: "",
      MembershipId: "",
      ProjectName: "",
      SiteDimension: "",
      TransactionId: "",
      PaymentType: "",
      PaidAmount: "",
      PaymentMode: "",
      SeniorityNumber: "",
      PhoneNumber: "",
      SelectBank: "",
      ReceiptDate: "",
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
        .matches(/^[A-Za-z]+$/, "only letters allowed"),

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

      PaymentType: yup
        .string()
        .required("Payment type is required")
        .oneOf(
          [
            "Down Payment",
            "Installment 1",
            "Installment 2",
            "Installment 3",
            "Installment 4",
            "Installment 5",
            "Installment 6",
          ],
          "Invalid payment type",
        ),

      PaidAmount: yup
        .number()
        .typeError("Paid amount must be a number")
        .required("Paid amount is required")
        .positive("Amount must be greater than 0"),

      PaymentMode: yup
        .string()
        .required("Payment mode is required")
        .oneOf(["Cash", "Cheque", "UPI"], "Select valid payment mode"),

      SeniorityNumber: yup
        .string()
        .required("Seniority number required")
        .min(3, "Minimum 3 characters required")
        .max(8, "Maximum 8 characters allowed")
        .matches(
          /^[A-Za-z0-9]+$/,
          "Only letters and numbers allowed (e.g., SN123654)",
        ),

      PhoneNumber: yup
        .string()
        .required("Phone number required")
        .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit number"),

      SelectBank: yup
        .string()
        .required("Bank selection is required")
        .oneOf(["SBI", "HDFC", "ICICI", "AXIS"], "Select valid bank"),

      ReceiptDate: yup
        .date()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .required("Receipt date is required")
        .max(new Date(), "Future date not allowed")
        .typeError("Please select valid date"),
    }),

    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: (values) => {
      console.log(values);
      alert("Successfully submitted");
    },
  });

  return (
    <>
      <div className="w-full mx-auto min-h-screen">
        <div className="w-full md:w-[50%] mx-auto">
          <h1 className="font-bold text-2xl my-6 ml-4">Receipt Form</h1>

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
                  onChange={formik.handleChange}
                  value={formik.values.Name}
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
                  type="string"
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
                  Payment Type <span className="text-red-500">*</span>
                </label>

                <select
                  name="PaymentType"
                  onChange={formik.handleChange}
                  value={formik.values.PaymentType}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                >
                  <option value="">Select</option>
                  <option value="Down Payment">Down Payment</option>
                  <option value="Installment 1">Installment 1</option>
                  <option value="Installment 2">Installment 2</option>
                  <option value="Installment 3">Installment 3</option>
                  <option value="Installment 4">Installment 4</option>
                  <option value="Installment 5">Installment 5</option>
                  <option value="Installment 6">Installment 6</option>
                </select>

                {formik.touched.PaymentType && formik.errors.PaymentType && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.PaymentType}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Paid Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="PaidAmount"
                  placeholder="1,50,500"
                  value={formik.values.PaidAmount}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                />
                {formik.touched.PaidAmount && formik.errors.PaidAmount && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.PaidAmount}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="PaymentMode"
                  value={formik.values.PaymentMode}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
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
                <label className="font-bold">
                  Seniority Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SeniorityNumber"
                  onChange={formik.handleChange}
                  value={formik.values.SeniorityNumber}
                  placeholder="SN13456"
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                />
                {formik.touched.SeniorityNumber &&
                  formik.errors.SeniorityNumber && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.SeniorityNumber}
                    </div>
                  )}
              </div>

              <div>
                <label className="font-bold">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="PhoneNumber"
                  placeholder="9855623594"
                  value={formik.values.PhoneNumber}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                />
                {formik.touched.PhoneNumber && formik.errors.PhoneNumber && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.PhoneNumber}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Select Bank <span className="text-red-500">*</span>
                </label>
                <select
                  name="SelectBank"
                  value={formik.values.SelectBank}
                  onChange={formik.handleChange}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                >
                  <option value="">Select</option>
                  <option value="SBI">SBI</option>
                  <option value="HDFC">HDFC</option>
                  <option value="ICICI">ICICI</option>
                  <option value="AXIS">AXIS</option>
                </select>
                {formik.touched.SelectBank && formik.errors.SelectBank && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.SelectBank}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold">
                  Receipt Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="ReceiptDate"
                  onChange={formik.handleChange}
                  value={formik.values.ReceiptDate}
                  className="border border-gray-200 p-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
                />
                {formik.touched.ReceiptDate && formik.errors.ReceiptDate && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.ReceiptDate}
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
                className="bg-gradient-to-r from-yellow-400 via-purple-500 to-purple-600 hover:bg-gray-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-shadow hover:text-black w-[200px]"
              >
                Generate Receipt
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};


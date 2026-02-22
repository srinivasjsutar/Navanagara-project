// import { useState } from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { Eye, EyeOff } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Header } from "./Header";

// const Schema = Yup.object({
//   adminname: Yup.string().required("Name is required"),
//   adminid: Yup.string().required("Membership ID is required"),
//   password: Yup.string()
//     .min(6, "Password must be at least 6 characters")
//     .max(20, "Password must not exceed 10 characters")
//     .matches(
//       /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]+$/,
//       'Password must contain at least one letter, one number, and only "_" is allowed as a special character',
//     )
//     .required("Password is required"),

//   confirmpassword: Yup.string()
//     .oneOf([Yup.ref("password"), null], "Passwords must match")
//     .required("Confirm Password is required"),
//   mobile: Yup.string()
//     .matches(/^(\+?[1-9]\d{0,3}|0)?[6-9]\d{9}$/, "Enter a valid contact number")
//     .required("Mobile Number is required"),

//   email: Yup.string().email("Invalid email address"),
// });

// export function AddAdmin (){
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const initialValues = {
//     adminname: "",
//     adminid: "",
//     password: "",
//     confirmpassword: "",
//     mobile: "",
//     email: "",
//   };

//   const handleSubmit = (values, { resetForm }) => {
//     console.log("Admin Added Successfully:", values);

//     // Show success toast notification
//     toast.success("Admin Added Successfully!", {
//       position: "top-right",
//       autoClose: 3000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//     });

//     resetForm();
//   };

//   return (
//   <div>
//     <Header />
//     <div className="h-[641px] w-[900px] pt-4 pb-12 -ml-8">
//       <ToastContainer />

//       <div className="ml-16 lg:ml-20 mr-8">
//         <div className="mb-10">
//           <h1 className="text-2xl font-semibold text-black">
//             Add Admin
//           </h1>
//         </div>

//         <div className="bg-[#FAF9FF] rounded-2xl overflow-hidden">
//           <div className="pl-4 pr-8 pt-8 pb-8 sm:pl-6 sm:pr-12 sm:pt-12 sm:pb-8">

//             <Formik
//               initialValues={initialValues}
//               validationSchema={Schema}
//               onSubmit={handleSubmit}
//             >
//               {({ errors, touched }) => (
//                 <Form>

//                   {/* ⭐ TWO COLUMN GRID DESIGN */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">

//                     {/* Admin Name */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Admin Name <span className="text-red-500">*</span>
//                       </label>
//                       <Field
//                         name="adminname"
//                         placeholder="Enter admin name"
//                         className={`w-full mt-2 px-4 py-2 rounded-lg border-2 ${
//                           errors.adminname && touched.adminname
//                             ? "border-red-300"
//                             : "border-slate-200"
//                         } outline-none`}
//                       />
//                       <ErrorMessage name="adminname" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                     {/* Admin ID */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Admin ID <span className="text-red-500">*</span>
//                       </label>
//                       <Field
//                         name="adminid"
//                         placeholder="Enter admin ID"
//                         className="w-full mt-2 px-4 py-2 rounded-lg border-2 border-slate-200 outline-none"
//                       />
//                       <ErrorMessage name="adminid" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                     {/* Mobile Number */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Mobile Number <span className="text-red-500">*</span>
//                       </label>
//                       <Field
//                         name="mobile"
//                         placeholder="Enter your mobile number"
//                         className="w-full mt-2 px-4 py-2 rounded-lg border-2 border-slate-200 outline-none"
//                       />
//                       <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                     {/* Email */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Email
//                       </label>
//                       <Field
//                         name="email"
//                         placeholder="Enter your email"
//                         className="w-full mt-2 px-4 py-2 rounded-lg border-2 border-slate-200 outline-none"
//                       />
//                       <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                     {/* Password */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Password <span className="text-red-500">*</span>
//                       </label>

//                       <div className="relative mt-2">
//                         <Field
//                           name="password"
//                           type={showPassword ? "text" : "password"}
//                           placeholder="Enter your password"
//                           className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 outline-none"
//                         />

//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-4 top-1/2 -translate-y-1/2"
//                         >
//                           {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
//                         </button>
//                       </div>

//                       <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                     {/* Confirm Password */}
//                     <div>
//                       <label className="text-sm font-semibold text-slate-700">
//                         Confirm Password <span className="text-red-500">*</span>
//                       </label>

//                       <div className="relative mt-2">
//                         <Field
//                           name="confirmpassword"
//                           type={showConfirmPassword ? "text" : "password"}
//                           placeholder="Confirm your password"
//                           className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 outline-none"
//                         />

//                         <button
//                           type="button"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                           className="absolute right-4 top-1/2 -translate-y-1/2"
//                         >
//                           {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
//                         </button>
//                       </div>

//                       <ErrorMessage name="confirmpassword" component="div" className="text-red-500 text-sm mt-1"/>
//                     </div>

//                   </div>

//                   {/* Submit Button */}
//                   <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
//                     <button
//                       type="submit"
//                       className="px-10 py-2.5 font-inter bg-gradient-to-r from-[#FFFF00] via-[#7158B6] to-[#7158B6] text-white font-bold rounded-full"
//                     >
//                       Confirm
//                     </button>
//                   </div>

//                 </Form>
//               )}
//             </Formik>

//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// };

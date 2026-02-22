import { Link, useLocation, useNavigate } from "react-router-dom";

export function SuperAdminSideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminData");
    navigate("/superadmin");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar w-[350px] shadow-xl flex flex-col bg-[#7C66CA] min-h-screen">
      <div className="p-6">
        <div className="flex justify-center">
          <img src="/images/logo.svg" className="w-[120px] h-[120px]" alt="Logo" />
        </div>
        <ul className="mt-[35px] w-[326px]">
          <li className="mt-3">
            <Link to="/superadmin/dashboard"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/dashboard") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/dashboard") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Dashboard
              </span>
            </Link>
          </li>
          <li className="mt-3">
            <Link to="/superadmin/addmember"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/addmember") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/addmember") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Member
              </span>
            </Link>
          </li>
          <li className="mt-3">
            <Link to="/superadmin/sitebookingform"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/sitebookingform") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/sitebookingform") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Site Booking
              </span>
            </Link>
          </li>
          <li className="mt-3">
            <Link to="/superadmin/receiptform"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/receiptform") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/receiptform") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Receipt
              </span>
            </Link>
          </li>
          <li className="mt-3">
            <Link to="/superadmin/report"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/report") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/report") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Reports
              </span>
            </Link>
          </li>
          <li className="mt-3">
            <Link to="/superadmin/payments"
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive("/superadmin/payments") ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}>
              <span className={isActive("/superadmin/payments") ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Payments
              </span>
            </Link>
          </li>
        </ul>
      </div>
      <div
        className="bg-white w-full p-4 mt-auto flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleSignOut}
      >
        <span className="text-[24px] text-dark ps-[30px]">Sign Out</span>
      </div>
    </div>
  );
}
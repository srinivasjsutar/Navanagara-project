import { Link, useLocation, useNavigate } from "react-router-dom";

export function SideBar({ prefix = "" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = prefix === "/superadmin";

  const handleSignOut = () => {
    if (isSuperAdmin) {
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("superAdminData");
      navigate("/superadmin");
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      sessionStorage.clear();
      navigate("/adminlogin");
    }
  };

  const isActive = (path, childPaths = []) => {
    if (location.pathname === path) return true;
    return childPaths.some(childPath => location.pathname === childPath);
  };

  return (
    <div className="sidebar w-[350px] shadow-xl flex flex-col bg-[#7C66CA] min-h-screen">
      <div className="p-6">
        <div className="flex justify-center">
          <img src="/images/logo.svg" className="w-[120px] h-[120px]" alt="Logo" />
        </div>
        <ul className="mt-[35px] w-[326px]">
          <li className="mt-3">
            <Link
              to={`${prefix}/dashboard`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/dashboard`) ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}
            >
              <img
                src={isActive(`${prefix}/dashboard`) ? "/images/purple_dashboard.svg" : "/images/dashboard.svg"}
                alt="Dashboard"
              />
              <span className={isActive(`${prefix}/dashboard`) ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Dashboard
              </span>
            </Link>
          </li>

          <li className="mt-3">
            <Link
              to={`${prefix}/addmember`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/addmember`) ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}
            >
              <img
                src={isActive(`${prefix}/addmember`) ? "/images/person_add.svg" : "/images/add_member_icon.svg"}
                alt="Add Member"
              />
              <span className={isActive(`${prefix}/addmember`) ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Member
              </span>
            </Link>
          </li>

          <li className="mt-3">
            <Link
              to={`${prefix}/sitebookingform`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/sitebookingform`) ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}
            >
              <img
                src={isActive(`${prefix}/sitebookingform`) ? "/images/calendar_add_on.svg" : "/images/calender.svg"}
                alt="Add Site Booking"
              />
              <span className={isActive(`${prefix}/sitebookingform`) ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Site Booking
              </span>
            </Link>
          </li>

          <li className="mt-3">
            <Link
              to={`${prefix}/receiptform`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/receiptform`) ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}
            >
              <img
                src={isActive(`${prefix}/receiptform`) ? "/images/purple_add_circle.svg" : "/images/add_circle.svg"}
                alt="Add Receipt"
              />
              <span className={isActive(`${prefix}/receiptform`) ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Add Receipt
              </span>
            </Link>
          </li>

          <li className="mt-3">
            <Link
              to={`${prefix}/report`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/report`, [`${prefix}/memberlist`, `${prefix}/sitebookinglist`, `${prefix}/receiptlist`])
                  ? "bg-[#FFFF00]"
                  : "hover:border hover:border-white"
              }`}
            >
              <img
                src={
                  isActive(`${prefix}/report`, [`${prefix}/memberlist`, `${prefix}/sitebookinglist`, `${prefix}/receiptlist`])
                    ? "/images/purple_bar_chart.svg"
                    : "/images/bar_chart.svg"
                }
                alt="Reports"
              />
              <span
                className={
                  isActive(`${prefix}/report`, [`${prefix}/memberlist`, `${prefix}/sitebookinglist`, `${prefix}/receiptlist`])
                    ? "text-[#7C66CA] font-semibold"
                    : "text-white"
                }
              >
                Reports
              </span>
            </Link>
          </li>

          <li className="mt-3">
            <Link
              to={`${prefix}/payments`}
              className={`flex py-1 rounded-s-xl px-4 gap-4 no-underline text-[20px] transition-all ${
                isActive(`${prefix}/payments`) ? "bg-[#FFFF00]" : "hover:border hover:border-white"
              }`}
            >
              <img
                src={isActive(`${prefix}/payments`) ? "/images/account_balance_wallet.svg" : "/images/payment_icon.svg"}
                alt="Payments"
              />
              <span className={isActive(`${prefix}/payments`) ? "text-[#7C66CA] font-semibold" : "text-white"}>
                Payments
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Sign Out — for both Admin and SuperAdmin at the bottom */}
      <div
        className="bg-white w-full p-4 mt-auto flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleSignOut}
      >
        <img src="/images/exit.svg" alt="Sign Out" />
        <span className="text-[24px] text-dark ps-[30px]">Sign Out</span>
      </div>
    </div>
  );
}
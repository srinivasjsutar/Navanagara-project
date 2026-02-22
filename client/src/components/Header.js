import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const isSuperAdmin = !!localStorage.getItem("superAdminToken");

  const storedData = isSuperAdmin
    ? localStorage.getItem("superAdminData")
    : localStorage.getItem("adminData");
  const userData = storedData ? JSON.parse(storedData) : null;
  const displayName = userData?.name || userData?.username || (isSuperAdmin ? "Super Admin" : "Admin");

  return (
    <div className="flex justify-between items-center px-10 py-[18px] shadow-sm">
      <div className="font-semibold text-[30px] text-[#7C66CA]">
        Welcome, Navanagara
      </div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src="/images/profile.webp"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-[14px] text-[#333]">
          {displayName}
        </span>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";

export function LoginHeader() {
  return (
    <div className="flex justify-content-between px-[80px] items-center h-[90px] lg:h-[90px] bg-[#7158B6]">
      
      {/* ===== LEFT SIDE : LOGO + RIGHT IMAGE ===== */}
      <div className="flex items-center">

        {/* LOGO */}
        <img src="/images/logo.svg" className="h-[60px]" />

        {/*
          ===== IMAGE AREA (RIGHT OF LOGO) =====
          👉 Change ml-[XXpx]  → gap from logo
          👉 Change w-[XXXpx] → width of second image
          👉 Change h-[XXXpx] → height of second image
        */}
        <div className="ml-[25px]">
          <img
            src="/images/NAVANAGARA HOUSE BUILDING CO-OPERATIVE SOCIETY LTD.webp"   // ✅ put your image path
            className="w-[320px] h-[60px] object-contain"
          />
        </div>

      </div>

      {/* ===== RIGHT SIDE BUTTON AREA ===== */}
      <div className="flex gap-3">
        {/* <Link to="#" className="text-[#6952A9] py-[12px] px-4 rounded-full bg-[#FFFF] font-semibold text-[16px] no-underline">
          Admin Login
        </Link> */}
      </div>

    </div>
  );
}

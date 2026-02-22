import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Header } from "../components/Header";

export function Report() {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith("/superadmin");
  const prefix = isSuperAdmin ? "/superadmin" : "";

  return (
    <div>
      <Header />
      <div className="text-[24px] font-semibold px-[100px] pt-[50px] pb-[40px]">
        Overall Report
      </div>
      <div className="flex gap-[56px] px-[100px]">
        <div className="flex flex-col justify-center items-center text-center lg:w-[452px] lg:h-[307px] border-1 p-[24px] rounded-3xl border-[#7C66CA]">
          <img src="/images/memberlist.svg" className="w-[60px] h-[60px]" />
          <div className="font-bold text-[20px]">All Member List</div>
          <div className="text-[18px] w-[280px] mt-[16px] font-inter">
            View all registered members Track active & inactive profiles Manage
            member details easily
          </div>
          <Link
            to={`${prefix}/memberlist`}
            className="no-underline text-[16px] text-[#FFFF00] bg-[#7C66CA] py-[8px] px-[70px] rounded-full font-semibold mt-3 flex"
          >
            View Report <ChevronRight />
          </Link>
        </div>
        <div className="flex flex-col justify-center items-center text-center lg:w-[452px] lg:h-[307px] border-1 p-[24px] rounded-3xl border-[#7C66CA]">
          <img src="/images/memberlist.svg" className="w-[60px] h-[60px]" />
          <div className="font-bold text-[20px]">Site Booking List</div>
          <div className="text-[18px] w-[280px] mt-[16px] font-inter">
            Monitor all site bookings Check booking status & dates Manage
            bookings in one place
          </div>
          <Link
            to={`${prefix}/sitebookinglist`}
            className="no-underline text-[16px] text-[#FFFF00] bg-[#7C66CA] py-[8px] px-[70px] rounded-full font-semibold mt-3 flex"
          >
            View Report <ChevronRight />
          </Link>
        </div>
      </div>
      <div className="flex mt-[38px] mb-5 mx-[100px] flex-col justify-center items-center text-center lg:w-[452px] lg:h-[307px] border-1 p-[24px] rounded-3xl border-[#7C66CA]">
        <img src="/images/memberlist.svg" className="w-[60px] h-[60px]" />
        <div className="font-bold text-[20px]">Receipt List</div>
        <div className="text-[18px] w-[280px] mt-[16px] font-inter">
          Access all payment receipts View paid & pending records Download and
          verify receipts
        </div>
        <Link
          to={`${prefix}/receiptlist`}
          className="no-underline text-[16px] text-[#FFFF00] bg-[#7C66CA] py-[8px] px-[70px] rounded-full font-semibold mt-3 flex"
        >
          View Report <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

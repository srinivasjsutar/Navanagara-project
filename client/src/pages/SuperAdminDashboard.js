import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { Header } from "../components/Header";
import BookingOverview from "../components/BookingOverview";

export function SuperAdminDashboard() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalsitebookings, setTotalSiteBookings] = useState(0);
  const [totalreceipts, setTotalReceipts] = useState(0);
  const [totalamount, setTotalAmount] = useState(0);

  useEffect(() => {
    axiosInstance.get("/members").then((res) => {
      setTotalMembers((res.data.data || []).length);
    });
  }, []);

  useEffect(() => {
    axiosInstance.get("/sitebookings").then((res) => {
      setTotalSiteBookings((res.data || []).length);
    });
  }, []);

  useEffect(() => {
    axiosInstance.get("/receipts").then((res) => {
      const receipts = res.data.data || [];
      setTotalReceipts(receipts.length);
      const total = receipts.reduce((sum, r) => sum + Number(r.amountpaid || 0), 0);
      setTotalAmount(total);
    });
  }, []);

  return (
    <div>
      <Header />
      <div className="px-[70px] py-10">
        <div className="text-[24px] font-semibold mb-6">Overview</div>

        <div className="flex flex-col lg:flex-row gap-[20px] pt-[24px]">
          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">Total Member</div>
                <div className="font-bold text-[30px] text-white">{totalMembers}</div>
              </div>
            </div>
          </div>

          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">Site Booking</div>
                <div className="font-bold text-[30px] text-white">{totalsitebookings}</div>
              </div>
            </div>
          </div>

          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">Total Receipt</div>
                <div className="font-bold text-[30px] text-white">{totalreceipts}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <BookingOverview />
      </div>
    </div>
  );
}
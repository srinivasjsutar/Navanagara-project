import { useEffect, useState } from "react";
import axiosInstance from "../api/axios"; // Import the axios instance
import { Header } from "../components/Header";
import BookingOverview from "../components/BookingOverview";
import PaymentTable from "../components/PaymentTable";

export function Dashboard() {
  const [totalMembers, SetTotalMembers] = useState(0);
  const [totalsitebookings, SetTotalSiteBookings] = useState(0);
  const [totalreceipts, SetTotalReceipts] = useState(0);
  const [totalamount, SetTotalAmout] = useState(0);

  const [totalmonthlymembers, SetTotalMonthlyMembers] = useState([]);
  const [totalmonthlysitebookings, SetTotalMonthlySiteBookings] = useState([]);
  const [totalmonthlyreceipts, SetTotalMonthlyReceipts] = useState([]);
  const [totalmonthlyamount, SetTotalMonthlyAmount] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [totalBookedAmount, setTotalBookedAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  const groupByMonthly = (data, amountField = null) => {
    const monthlyData = {};

    data.forEach((item) => {
      const dateValue =
        item.createdAt ||
        item.date ||
        item.created_at ||
        item.bookingDate ||
        item.receiptDate;

      if (!dateValue) {
        console.warn("No date field found for item:", item);
        return;
      }

      const date = new Date(dateValue);

      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateValue, "for item:", item);
        return;
      }

      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          count: 0,
          amount: 0,
        };
      }

      monthlyData[monthYear].count++;

      // ✅ IMPORTANT: Always add as Number
      if (amountField) {
        monthlyData[monthYear].amount += Number(item[amountField] || 0);
      }
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  };

  const getAllUniqueMonths = () => {
    const months = new Set();

    totalmonthlymembers.forEach(
      (item) => item?.month && months.add(item.month),
    );
    totalmonthlysitebookings.forEach(
      (item) => item?.month && months.add(item.month),
    );
    totalmonthlyamount.forEach((item) => item?.month && months.add(item.month));

    // latest first
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  };

  const getFilteredData = () => {
    if (selectedMonth === "all") {
      return {
        members: totalMembers,
        bookings: totalsitebookings,
        receipts: totalreceipts,
        amount: totalamount,
      };
    }

    const memberData = totalmonthlymembers.find(
      (item) => item.month === selectedMonth,
    );
    const bookingData = totalmonthlysitebookings.find(
      (item) => item.month === selectedMonth,
    );
    const receiptData = totalmonthlyamount.find(
      (item) => item.month === selectedMonth,
    );

    return {
      members: memberData?.count || 0,
      bookings: bookingData?.count || 0,
      receipts: receiptData?.count || 0,
      amount: receiptData?.amount || 0,
    };
  };

  const getInvoiceStats = () => {
    // all time
    if (selectedMonth === "all") {
      const overdue = Math.max(totalBookedAmount - totalPaidAmount, 0);
      return { total: totalBookedAmount, paid: totalPaidAmount, overdue };
    }

    // month-wise totals
    const bookingMonth = totalmonthlysitebookings.find(
      (x) => x.month === selectedMonth,
    );
    const receiptMonth = totalmonthlyreceipts.find(
      (x) => x.month === selectedMonth,
    );

    const total = Number(bookingMonth?.amount || 0);
    const paid = Number(receiptMonth?.amount || 0);
    const overdue = Math.max(total - paid, 0);

    return { total, paid, overdue };
  };

  const formatMonthDisplay = (monthString) => {
    if (monthString === "all") return "All Time";

    if (!monthString || !monthString.match(/^\d{4}-\d{2}$/))
      return "Invalid Date";

    const [year, month] = monthString.split("-");
    const date = new Date(year, month - 1);

    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // ✅ FIXED: Fetch Members with axiosInstance
  useEffect(() => {
    axiosInstance
      .get("/members")
      .then((response) => {
        const members = response.data.data || [];
        SetTotalMembers(members.length);
        const monthlyData = groupByMonthly(members);
        SetTotalMonthlyMembers(monthlyData);
        console.log("✅ Members fetched:", members.length);
      })
      .catch((error) => {
        console.error("❌ Error fetching Members:", error);
      });
  }, []);

  // ✅ FIXED: Fetch Site Bookings with axiosInstance (was using relative URL!)
  useEffect(() => {
    axiosInstance
      .get("/sitebookings")
      .then((response) => {
        const bookings = response.data || [];

        SetTotalSiteBookings(bookings.length);

        // monthly booked amount (sum totalamount)
        const monthlyData = groupByMonthly(bookings, "totalamount");
        SetTotalMonthlySiteBookings(monthlyData);

        const bookedTotal = bookings.reduce(
          (sum, b) => sum + Number(b.totalamount || 0),
          0,
        );
        setTotalBookedAmount(bookedTotal);
        console.log("✅ Site Bookings fetched:", bookings.length);
      })
      .catch((error) => {
        console.error("❌ Error fetching Site Bookings:", error);
      });
  }, []);

  // ✅ FIXED: Fetch Receipts with axiosInstance
  useEffect(() => {
    axiosInstance
      .get("/receipts")
      .then((response) => {
        const receipts = response.data.data || [];

        SetTotalReceipts(receipts.length);

        // Use totalreceived if exists, otherwise fallback to amountpaid
        const normalizeReceipts = receipts.map((r) => {
          const amountpaid = Number(r.amountpaid || 0);
          const bookingamount = Number(r.bookingamount || 0);
          const totalreceived =
            r.totalreceived != null
              ? Number(r.totalreceived)
              : amountpaid + bookingamount;

          return { ...r, totalreceived };
        });

        const monthlyData = groupByMonthly(normalizeReceipts, "totalreceived");
        SetTotalMonthlyReceipts(monthlyData);
        SetTotalMonthlyAmount(monthlyData);

        const paidTotal = normalizeReceipts.reduce(
          (sum, r) => sum + Number(r.totalreceived || 0),
          0,
        );

        setTotalPaidAmount(paidTotal);
        SetTotalAmout(paidTotal);
        console.log("✅ Receipts fetched:", receipts.length);
      })
      .catch((error) => {
        console.error("❌ Error fetching Receipts:", error);
      });
  }, []);

  useEffect(() => {
    const months = getAllUniqueMonths();
    setAvailableMonths(months);
  }, [totalmonthlymembers, totalmonthlysitebookings, totalmonthlyamount]);

  const filteredData = getFilteredData();
  const invoiceStats = getInvoiceStats();

  return (
    <div>
      <Header />
      <div className="px-[70px] py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="text-[24px] font-semibold">Overview</div>

          <div className="flex items-center gap-3">
            <label className="text-[16px] font-medium text-gray-700">
              Select Period:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C66CA] focus:border-transparent bg-white text-gray-700 min-w-[200px]"
            >
              <option value="all">All Time</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthDisplay(month)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[20px] pt-[24px]">
          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">
                  Total Member
                </div>
                <div className="font-bold text-[30px] text-white">
                  {filteredData.members}
                </div>
                <p className="text-[14px] text-white">
                  {selectedMonth === "all"
                    ? "All Time"
                    : formatMonthDisplay(selectedMonth)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">
                  Site Booking
                </div>
                <div className="font-bold text-[30px] text-white">
                  {filteredData.bookings}
                </div>
                <p className="text-[14px] text-white">
                  {selectedMonth === "all"
                    ? "All Time"
                    : formatMonthDisplay(selectedMonth)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:w-[235px] lg:h-[119px] bg-[#7C66CA] rounded-xl">
            <div className="px-[20px] flex py-[16px]">
              <div className="h-[57px] w-[4px] bg-[#FFFF00] rounded-lg"></div>
              <div className="px-[20px]">
                <div className="text-[18px] font-semibold text-white">
                  Total Receipt
                </div>
                <div className="font-bold text-[30px] text-white">
                  {filteredData.receipts}
                </div>
                <p className="text-[14px] text-white">
                  {selectedMonth === "all"
                    ? "All Time"
                    : formatMonthDisplay(selectedMonth)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month-wise stats go here */}
      {/* <div className="flex">
        <BookingOverview />
      </div>
      <div>
        <PaymentTable />
      </div> */}
    </div>
  );
}

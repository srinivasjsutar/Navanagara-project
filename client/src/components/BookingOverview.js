import axios from "axios";
import { useEffect, useState } from "react";
import * as Recharts from "recharts";

export default function BookingOverview() {
  const [chartData, setChartData] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);

  const groupBookingsByMonth = (bookings) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const map = {};

    bookings.forEach((b) => {
      if (!b.date) return;

      const d = new Date(b.date);
      if (isNaN(d.getTime())) return;

      const month = months[d.getMonth()];
      map[month] = (map[month] || 0) + 1;
    });

    return months.map((m) => ({
      month: m,
      bookings: map[m] || 0,
    }));
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/sitebookings")
      .then((res) => {
        const bookings = res.data || [];
        setTotalBookings(bookings.length);
        setChartData(groupBookingsByMonth(bookings));
      })
      .catch((err) => console.error("Error fetching sitebookings:", err));
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto h-[400px] p-4 bg-white rounded-3xl shadow-lg">
      <h1 className="text-xl font-semibold text-gray-900 px-2">
        Booking Overview ({totalBookings})
      </h1>

      <Recharts.ResponsiveContainer width="100%" height={320}>
        <Recharts.LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <Recharts.CartesianGrid  vertical={true} horizontal={false} stroke="#e5e7eb"/>
          <Recharts.XAxis dataKey="month" />
          <Recharts.YAxis allowDecimals={false} />
          <Recharts.Tooltip />
          <Recharts.Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} />
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
  
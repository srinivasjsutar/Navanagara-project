import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function InvoiceStatistics({
  totalAmount = 0,
  paidAmount = 0,
  overdueAmount = 0,
}) {
  const pendingAmount = Math.max(totalAmount - paidAmount, 0);

  const safeTotal =
    totalAmount > 0 ? totalAmount : paidAmount + pendingAmount + overdueAmount;

  const donutData = useMemo(() => {
    return {
      labels: ["Paid Amount", "Pending Amount", "Overdue Amount"],
      datasets: [
        {
          data: [paidAmount, pendingAmount, overdueAmount],
          backgroundColor: ["#7C66CA", "#F7D05C", "#B4B4B4"],
          borderColor: "#ffffff",
          borderWidth: 2,
          cutout: "70%",
        },
      ],
    };
  }, [paidAmount, pendingAmount, overdueAmount]);

  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.raw || 0);
              const percent =
                safeTotal > 0 ? ((value / safeTotal) * 100).toFixed(1) : "0.0";
              return `₹${value.toLocaleString()} (${percent}%)`;
            },
          },
        },
      },
    };
  }, [safeTotal]);

  return (
    <div className="bg-white rounded-xl w-[450px] h-[360px] shadow px-3 py-4 ms-5">
      <h2 className="text-xl font-semibold ">Invoice Statistics</h2>

      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="w-64 h-64 mt-4">
          <Doughnut data={donutData} options={options} />
        </div>

        <div className="mt-2">
          <div>
            <div className="text-purple-600 font-medium">Paid Amount</div>
            <div className="text-lg font-semibold">
              ₹{paidAmount.toLocaleString()}
            </div>
          </div>

          <div className="mt-2">
            <div className="text-yellow-500 font-medium">Pending Amount</div>
            <div className="text-lg font-semibold">
              ₹{pendingAmount.toLocaleString()}
            </div>
          </div>

          <div className="my-2">
            <div className="text-gray-500 font-medium">Overdue Amount</div>
            <div className="text-lg font-semibold">
              ₹{overdueAmount.toLocaleString()}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-gray-700 font-medium">Total Amount</div>
            <div className="text-lg font-semibold">
              ₹{totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Icon } from "@graminate/ui";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  data: {
    free: number;
    paid: number;
  };
  isLoading: boolean;
};

const UserDistributionWidget = ({ data, isLoading }: Props) => {
  const chartData = {
    labels: ["Free Users", "Paid Users"],
    datasets: [
      {
        data: [data.free, data.paid],
        backgroundColor: ["#E2E8F0", "#2b7860"],
        borderColor: ["#CBD5E0", "#1f5c4a"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    cutout: "70%",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-dark dark:text-light uppercase tracking-wider">
            Plan Distribution
          </h3>
          <p className="text-xs text-dark dark:text-light mt-1">
            Ratio of free vs premium subscriptions
          </p>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Icon type="pie_chart" className="size-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative size-40">
          {isLoading ? (
             <div className="size-full bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : (
            <Pie data={chartData} options={options} />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-dark dark:text-light">
              {isLoading ? "..." : (data.free + data.paid)}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-slate-200" />
              <span className="text-sm font-medium text-dark dark:text-light">Free Users</span>
            </div>
            <span className="text-sm font-bold text-dark dark:text-light">{data.free}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#2b7860]" />
              <span className="text-sm font-medium text-dark dark:text-light">Paid Users</span>
            </div>
            <span className="text-sm font-bold text-dark dark:text-light">{data.paid}</span>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center text-xs">
                <span className="text-dark dark:text-light">Paid Conversion Rate</span>
                <span className="font-bold text-green-600">
                  {data.free + data.paid > 0 ? ((data.paid / (data.free + data.paid)) * 100).toFixed(1) : 0}%
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDistributionWidget;

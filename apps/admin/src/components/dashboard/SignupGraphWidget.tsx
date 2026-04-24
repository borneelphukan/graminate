import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Icon, Button, Dropdown } from "@graminate/ui";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Props = {
  data: {
    labels: string[];
    signupCounts: number[];
    basicConversionRates: number[];
    proConversionRates: number[];
  };
  isLoading: boolean;
  onPeriodChange?: (period: string) => void;
};

const TIME_RANGE_OPTIONS = ["Daily", "Weekly", "Monthly", "Yearly"];

const SignupGraphWidget = ({ data, isLoading, onPeriodChange }: Props) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("Weekly");
  const [viewMode, setViewMode] = useState<"SIGNUPS" | "CONVERSION">("SIGNUPS");
  const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const chartData = {
    labels: data.labels,
    datasets: viewMode === "SIGNUPS" ? [
      {
        label: "New Signups",
        data: data.signupCounts,
        fill: true,
        backgroundColor: "rgba(43, 120, 96, 0.1)",
        borderColor: "#2b7860",
        pointBackgroundColor: "#2b7860",
        pointBorderColor: "#fff",
        tension: 0.4,
        borderWidth: 2,
      }
    ] : [
      {
        label: "Basic Conversion (%)",
        data: data.basicConversionRates,
        fill: false,
        backgroundColor: "transparent",
        borderColor: "#60a5fa",
        pointBackgroundColor: "#60a5fa",
        pointBorderColor: "#fff",
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Pro Conversion (%)",
        data: data.proConversionRates,
        fill: false,
        backgroundColor: "transparent",
        borderColor: "#8b5cf6",
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#fff",
        tension: 0.4,
        borderWidth: 2,
      }
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
          font: { size: 10, weight: "bold" },
          color: isDark ? "#94a3b8" : "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 11 },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 11 },
          callback: (value) => viewMode === "CONVERSION" ? `${value}%` : value,
        },
        title: {
          display: true,
          text: viewMode === "CONVERSION" ? "Conversion %" : "Signups",
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 10, weight: "bold" },
        },
      },
    },
  };

  const handleTimeRangeSelect = (period: string) => {
    setSelectedTimeRange(period);
    onPeriodChange?.(period);
  };

  const totalSignups = data.signupCounts.reduce((a, b) => a + b, 0);
  
  const totalBasicConverted = data.signupCounts.reduce((acc, count, i) => {
    return acc + (count * (data.basicConversionRates[i] || 0)) / 100;
  }, 0);
  const avgBasicRate = totalSignups > 0 ? (totalBasicConverted / totalSignups) * 100 : 0;

  const totalProConverted = data.signupCounts.reduce((acc, count, i) => {
    return acc + (count * (data.proConversionRates[i] || 0)) / 100;
  }, 0);
  const avgProRate = totalSignups > 0 ? (totalProConverted / totalSignups) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-md transition-all lg:col-span-3 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-dark dark:text-light uppercase tracking-wider">
            Growth & Conversion Insights
          </h3>
          <p className="text-xs text-dark dark:text-light mt-1">
            New registrations vs. tier-wise conversion
          </p>
        </div>

        <div className="flex bg-gray-500 dark:bg-gray-800 p-1 rounded-xl border border-gray-400 dark:border-gray-700">
          <button
            onClick={() => setViewMode("SIGNUPS")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "SIGNUPS"
                ? "bg-white dark:bg-gray-700 text-dark shadow-sm"
                : "text-dark hover:text-dark dark:hover:text-light"
            }`}
          >
            Signups
          </button>
          <button
            onClick={() => setViewMode("CONVERSION")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "CONVERSION"
                ? "bg-white dark:bg-gray-700 text-dark shadow-sm"
                : "text-dark hover:text-dark dark:hover:text-light"
            }`}
          >
            Conversion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
        <div className="lg:col-span-3 h-80 relative">
          {isLoading ? (
            <div className="size-full bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                Loading insights data...
              </span>
            </div>
          ) : data.labels.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="size-full flex flex-col items-center justify-center text-gray-400">
              <Icon type="query_stats" className="size-8 mb-2 opacity-20" />
              <p className="text-sm">No data available for this range</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-4 lg:border-l lg:border-gray-400 dark:lg:border-gray-700 lg:pl-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-tight mb-1">
              New Signups
            </p>
            <div className="flex items-baseline space-x-2">
              <h4 className="text-2xl font-bold text-dark dark:text-light">
                {isLoading ? "..." : totalSignups}
              </h4>
              <span className="text-xs text-dark dark:text-light bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded">
                +{selectedTimeRange}
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-300 dark:border-blue-900/20">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight mb-1">
              Basic Conversion
            </p>
            <div className="flex items-baseline space-x-2">
              <h4 className="text-2xl font-bold text-dark dark:text-light">
                {isLoading ? "..." : `${avgBasicRate.toFixed(1)}%`}
              </h4>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-tight mb-1">
              Pro Conversion
            </p>
            <div className="flex items-baseline space-x-2">
              <h4 className="text-2xl font-bold text-dark dark:text-light">
                {isLoading ? "..." : `${avgProRate.toFixed(1)}%`}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          icon={{ left: "chevron_left" }}
          label="Previous"
          onClick={() => {}}
          variant="ghost"
          disabled={isLoading}
        />
        <Dropdown
          direction="up"
          items={TIME_RANGE_OPTIONS}
          selectedItem={selectedTimeRange}
          onSelect={handleTimeRangeSelect}
        />
        <Button
          icon={{ right: "chevron_right" }}
          label="Next"
          onClick={() => {}}
          variant="ghost"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default SignupGraphWidget;

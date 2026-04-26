import { useState, useEffect, useRef, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  ArcElement,
  PieController,
} from "chart.js";
import type {
  ChartData,
  ChartOptions,
  Chart,
} from "chart.js";
import { format } from "date-fns";
import { Dropdown, Input } from "@graminate/ui";
import LoanModal from "@/components/modals/LoanModal";
import { DailyFinancialEntry } from "@/hooks/finance";
import Loader from "@/components/ui/Loader";

ChartJS.register(
  BarController,
  LineController,
  PieController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const CHART_TYPES = ["Debt Trend", "Debt Breakdown"] as const;
type ChartType = (typeof CHART_TYPES)[number];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type DebtAnalysisProps = {
  initialFullHistoricalData: DailyFinancialEntry[];
  loans: any[];
  isLoadingData: boolean;
  onRefresh: () => void;
};

const DebtAnalysis = ({
  initialFullHistoricalData,
  loans,
  isLoadingData,
  onRefresh,
}: DebtAnalysisProps) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(
    CHART_TYPES[0]
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState("Monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const filteredHistoricalData = useMemo(() => {
    let data = initialFullHistoricalData;

    if (startDate && endDate) {
      data = data.filter(
        (entry) =>
          entry.date >= startDate &&
          entry.date <= endDate
      );
    } else {
      let days = 30;
      if (selectedTimeRange === "Weekly") days = 7;
      else if (selectedTimeRange === "Monthly") days = 30;
      else if (selectedTimeRange === "3 Months") days = 90;
      data = data.slice(-days);
    }
    return data;
  }, [initialFullHistoricalData, selectedTimeRange, startDate, endDate]);

  const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

  const isDarkMode = useMemo(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  }, []);

  useEffect(() => {
    if (chartRef.current && !isLoadingData) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();

        let data: ChartData<any>;
        let options: ChartOptions<any>;

        if (selectedChartType === "Debt Trend") {
          // Calculate trend based on historical dates
          const labels = filteredHistoricalData
            .filter((_, i) => i % Math.max(1, Math.floor(filteredHistoricalData.length / 10)) === 0)
            .map((d) => format(d.date, "MMM d"));
          
          // Calculate dynamic trend: sum only active loans for each day
          const dataValues = filteredHistoricalData.map((d) => {
            const day = d.date;
            return loans.reduce((sum, loan) => {
              const startDate = new Date(loan.start_date);
              const endDate = loan.end_date ? new Date(loan.end_date) : null;
              
              // If loan has started and (no end date or end date is in the future/today)
              if (day >= startDate && (!endDate || day <= endDate)) {
                return sum + Number(loan.amount);
              }
              return sum;
            }, 0);
          })
          .filter((_, i) => i % Math.max(1, Math.floor(filteredHistoricalData.length / 10)) === 0);

          data = {
            labels,
            datasets: [
              {
                label: "Total Outstanding Debt",
                data: dataValues,
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
              },
            ],
          };

          options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: "Debt Repayment Trend",
                color: isDarkMode ? "#FFF" : "#374151",
                font: { size: 16 },
              },
              tooltip: {
                callbacks: {
                  label: (c: any) => `Debt: ${formatCurrency(c.parsed.y)}`,
                },
              },
            },
            scales: {
              x: {
                grid: { color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
                ticks: { color: isDarkMode ? "#D1D5DB" : "#4B5563" },
              },
              y: {
                beginAtZero: false,
                grid: { color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
                ticks: {
                  color: isDarkMode ? "#D1D5DB" : "#4B5563",
                  callback: (v: any) => formatCurrency(v),
                },
              },
            },
          };
        } else {
          // Debt Breakdown (Pie Chart)
          data = {
            labels: loans.map((d) => d.loan_name),
            datasets: [
              {
                data: loans.map((d) => Number(d.amount)),
                backgroundColor: [
                  "rgba(239, 68, 68, 0.8)",
                  "rgba(245, 158, 11, 0.8)",
                  "rgba(59, 130, 246, 0.8)",
                  "rgba(16, 185, 129, 0.8)",
                  "rgba(139, 92, 246, 0.8)",
                ],
                borderColor: isDarkMode ? "#1F2937" : "#FFF",
                borderWidth: 2,
              },
            ],
          };

          options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: isDarkMode ? "#D1D5DB" : "#4B5563",
                  padding: 20,
                  usePointStyle: true,
                },
              },
              title: {
                display: true,
                text: "Debt Portfolio Breakdown",
                color: isDarkMode ? "#FFF" : "#374151",
                font: { size: 16 },
              },
              tooltip: {
                callbacks: {
                  label: (c: any) => `${c.label}: ${formatCurrency(c.parsed)}`,
                },
              },
            },
          };
        }

        chartInstanceRef.current = new ChartJS(ctx, {
          type: selectedChartType === "Debt Trend" ? "line" : "pie",
          data,
          options,
        });
      }
    }
  }, [selectedChartType, isLoadingData, filteredHistoricalData, isDarkMode, loans]);

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg h-[500px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Loans & Debt Analysis
        </h3>
        <p className="text-sm text-dark dark:text-light">
          Monitor your outstanding liabilities and repayment progress.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start gap-3 sm:gap-4 my-4">
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Input
              id="start-date"
              label="Start Date"
              type="date"
              value={startDate && isValidDate(startDate) ? format(startDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const v = e.target.value;
                const d = new Date(v);
                if (isValidDate(d)) setStartDate(d);
                else setStartDate(null);
              }}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Input
              id="end-date"
              label="End Date"
              type="date"
              value={endDate && isValidDate(endDate) ? format(endDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const v = e.target.value;
                const d = new Date(v);
                if (isValidDate(d)) setEndDate(d);
                else setEndDate(null);
              }}
              placeholder="YYYY-MM-DD"
              disabled={!startDate || !isValidDate(startDate)}
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Dropdown
              label="Time Range"
              items={["Weekly", "Monthly", "3 Months"]}
              selectedItem={selectedTimeRange}
              onSelect={(i) => setSelectedTimeRange(i)}
              placeholder="Select Range"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Dropdown
              label="View Analysis"
              items={CHART_TYPES.slice()}
              selectedItem={selectedChartType}
              onSelect={(i) => setSelectedChartType(i as ChartType)}
              placeholder="Select View"
            />
          </div>
        </div>

      <div className="relative h-72 sm:h-80 md:h-96">
        <canvas ref={chartRef}></canvas>
      </div>

      <LoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default DebtAnalysis;

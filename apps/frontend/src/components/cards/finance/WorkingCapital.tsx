import { useState, useEffect, useRef, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from "chart.js";
import type {
  ChartData,
  ChartOptions,
  Chart,
  CartesianScaleOptions,
} from "chart.js";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  min as minDateFn,
  subDays as subDaysDateFns,
  addDays as addDaysDateFns,
  isValid as isValidDate,
} from "date-fns";
import { Dropdown, Button, Input } from "@graminate/ui";
import Loader from "@/components/ui/Loader";
import { DailyFinancialEntry } from "@/hooks/finance";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const TIME_RANGE_OPTIONS = ["Weekly", "Monthly", "3 Months"] as const;
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type WorkingCapitalProps = {
  initialFullHistoricalData: DailyFinancialEntry[];
  isLoadingData: boolean;
  openingBalance: number;
};

const WorkingCapital = ({
  initialFullHistoricalData,
  isLoadingData,
  openingBalance,
}: WorkingCapitalProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TIME_RANGE_OPTIONS[1]
  );
  const [dateOffset, setDateOffset] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fullHistoricalWorkingCapitalData = useMemo(() => {
    let cumulativeBalance = openingBalance; // Use the opening balance as the initial anchor
    
    return initialFullHistoricalData.map((entry) => {
      // Net flow for the day
      const dailyAssets = entry.revenue.total;
      const dailyLiabilities = entry.cogs.total + entry.expenses.total;
      const dailyNetFlow = dailyAssets - dailyLiabilities;
      
      // Accumulate the balance over time
      cumulativeBalance += dailyNetFlow;

      return {
        date: entry.date,
        currentAssets: dailyAssets, // Keep daily for tooltip/ref
        currentLiabilities: dailyLiabilities, // Keep daily for tooltip/ref
        netWorkingCapital: parseFloat(cumulativeBalance.toFixed(2)),
      };
    });
  }, [initialFullHistoricalData, openingBalance]);

  const earliestDataPointDate = useMemo(
    () =>
      fullHistoricalWorkingCapitalData.length > 0
        ? fullHistoricalWorkingCapitalData[0].date
        : null,
    [fullHistoricalWorkingCapitalData]
  );

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    setDateOffset(0);
  }, [selectedTimeRange, startDate, endDate]);

  const handleStartDateChange = (dateString: string) => {
    if (dateString) {
      const d = new Date(dateString);
      if (isValidDate(d)) {
        d.setHours(0, 0, 0, 0);
        setStartDate(d);
        if (endDate && isBefore(endDate, d)) setEndDate(null);
      } else setStartDate(null);
    } else setStartDate(null);
  };
  const handleEndDateChange = (dateString: string) => {
    if (dateString) {
      const d = new Date(dateString);
      if (isValidDate(d)) {
        d.setHours(23, 59, 59, 999);
        setEndDate(d);
        if (startDate && isBefore(d, startDate)) setStartDate(null);
      } else setEndDate(null);
    } else setEndDate(null);
  };

  const isCustomDateRangeActive = useMemo(
    () =>
      !!(
        startDate &&
        endDate &&
        isValidDate(startDate) &&
        isValidDate(endDate) &&
        !isBefore(endDate, startDate)
      ),
    [startDate, endDate]
  );

  const navigationStates = useMemo(() => {
    let pD = true;
    let nD = true;
    if (!isCustomDateRangeActive && earliestDataPointDate) {
      nD = dateOffset === 0;
      pD = false;
      if (selectedTimeRange === "Weekly") {
        const pW = subDaysDateFns(addWeeks(today, dateOffset - 1), 6);
        if (isBefore(pW, earliestDataPointDate)) pD = true;
      } else if (selectedTimeRange === "Monthly") {
        const pM = startOfMonth(addMonths(today, dateOffset - 1));
        if (isBefore(pM, earliestDataPointDate)) pD = true;
      } else {
        pD = true;
      }
    }
    return { isPrevDisabled: pD, isNextDisabled: nD };
  }, [
    dateOffset,
    selectedTimeRange,
    isCustomDateRangeActive,
    earliestDataPointDate,
    today,
  ]);
  const isPrevDisabled = navigationStates.isPrevDisabled;
  const isNextDisabled = navigationStates.isNextDisabled;

  const currentIntervalDates = useMemo(() => {
    if (fullHistoricalWorkingCapitalData.length === 0) return [];
    let vS: Date, vE: Date;
    if (isCustomDateRangeActive && startDate && endDate) {
      vS = startDate;
      vE = endDate;
    } else {
      const rD = today;
      if (selectedTimeRange === "Weekly") {
        const tD = addWeeks(rD, dateOffset);
        vE = tD;
        vS = subDaysDateFns(tD, 6);
      } else if (selectedTimeRange === "Monthly") {
        const tMD = addMonths(rD, dateOffset);
        vS = startOfMonth(tMD);
        vE = endOfMonth(tMD);
      } else {
        vS = startOfMonth(subMonths(rD, 2));
        vE = minDateFn([rD, endOfMonth(rD)]);
      }
    }
    return eachDayOfInterval({ start: vS, end: vE });
  }, [
    isCustomDateRangeActive,
    startDate,
    endDate,
    selectedTimeRange,
    dateOffset,
    today,
    fullHistoricalWorkingCapitalData,
  ]);

  useEffect(() => {
    if (chartRef.current && fullHistoricalWorkingCapitalData.length > 0) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();

        const dateLabels: string[] = [];
        const dataValues: (number | null)[] = [];
        const barColors: string[] = [];
        let xAxisTitleText: string = "";

        if (isCustomDateRangeActive && startDate && endDate) {
          xAxisTitleText = `Range: ${format(
            startDate,
            "MMM d, yyyy"
          )} - ${format(endDate, "MMM d, yyyy")}`;
        } else {
          if (selectedTimeRange === "Weekly") {
            const vS = currentIntervalDates[0],
              vE = currentIntervalDates[currentIntervalDates.length - 1];
            xAxisTitleText = `Week: ${format(vS, "MMM d")} - ${format(
              vE,
              "MMM d, yyyy"
            )}`;
          } else if (selectedTimeRange === "Monthly") {
            const vS = currentIntervalDates[0];
            xAxisTitleText = `Month: ${format(vS, "MMMM yyyy")}`;
          } else {
            const vS = currentIntervalDates[0],
              vE = currentIntervalDates[currentIntervalDates.length - 1];
            xAxisTitleText = `Last 3 Months (${format(
              vS,
              "MMM yyyy"
            )} - ${format(vE, "MMM yyyy")})`;
          }
        }

        currentIntervalDates.forEach((day) => {
          const dataPoint = fullHistoricalWorkingCapitalData.find((d) =>
            isSameDay(d.date, day)
          );
          if (dataPoint) {
            if (
              isCustomDateRangeActive ||
              isBefore(day, addDaysDateFns(today, 1)) ||
              isSameDay(day, today)
            ) {
              dataValues.push(dataPoint.netWorkingCapital);
              barColors.push("rgba(75, 192, 192, 0.7)");
            } else {
              dataValues.push(null);
              barColors.push("rgba(200, 200, 200, 0.1)");
            }
          } else {
            dataValues.push(null);
            barColors.push("rgba(200, 200, 200, 0.1)");
          }
          dateLabels.push(
            format(
              day,
              isCustomDateRangeActive
                ? currentIntervalDates.length > 31
                  ? "MMM d"
                  : "d"
                : selectedTimeRange === "Weekly" ||
                  selectedTimeRange === "Monthly"
                ? "EEE d"
                : "MMM d"
            )
          );
        });

        const isDarkMode = document.documentElement.classList.contains("dark");
        const chartTitleText = `Net Working Capital - ${
          isCustomDateRangeActive ? "Custom Range" : selectedTimeRange
        }`;
        const yAxisLabelText = `Amount (INR)`;

        const data: ChartData<"bar"> = {
          labels: dateLabels,
          datasets: [
            {
              label: "Net Working Capital",
              data: dataValues,
              backgroundColor: barColors,
              borderColor: barColors.map((color) =>
                color.replace("0.7", "1").replace("0.1", "0.3")
              ),
              borderWidth: 1,
            },
          ],
        };
        let maxTicks;
        if (isCustomDateRangeActive) {
          if (currentIntervalDates.length <= 7)
            maxTicks = currentIntervalDates.length;
          else if (currentIntervalDates.length <= 31)
            maxTicks = Math.ceil(
              currentIntervalDates.length /
                (currentIntervalDates.length > 15 ? 2 : 1)
            );
          else maxTicks = 15;
        } else {
          if (selectedTimeRange === "Weekly") maxTicks = 7;
          else if (selectedTimeRange === "Monthly")
            maxTicks =
              currentIntervalDates.length > 15
                ? 15
                : currentIntervalDates.length;
          else maxTicks = 12;
        }

        const options: ChartOptions<"bar"> = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: chartTitleText,
              font: { size: 16 },
              color: isDarkMode ? "#FFF" : "#374151",
            },
            tooltip: {
              enabled: true,
              mode: "index",
              intersect: false,
              callbacks: {
                label: (c) =>
                  `${c.dataset.label || ""}: ${
                    c.parsed.y !== null ? formatCurrency(c.parsed.y) : ""
                  }`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: xAxisTitleText,
                color: isDarkMode ? "#9CA3AF" : "#6B7280",
              },
              grid: {
                color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              },
              ticks: {
                color: isDarkMode ? "#D1D5DB" : "#4B5563",
                autoSkip: true,
                maxTicksLimit: maxTicks,
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: yAxisLabelText,
                color: isDarkMode ? "#9CA3AF" : "#6B7280",
              },
              grid: {
                color: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              },
              ticks: {
                color: isDarkMode ? "#D1D5DB" : "#4B5563",
                callback: (v) =>
                  typeof v === "number" ? formatCurrency(v) : v,
              },
            },
          },
        };
        chartInstanceRef.current = new ChartJS(ctx, {
          type: "bar",
          data,
          options,
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [
    selectedTimeRange,
    dateOffset,
    startDate,
    endDate,
    isCustomDateRangeActive,
    currentIntervalDates,
    fullHistoricalWorkingCapitalData,
    today,
  ]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const chartInstance = chartInstanceRef.current;
      if (
        !chartInstance ||
        !chartInstance.options ||
        !chartInstance.options.scales ||
        !chartInstance.options.plugins
      )
        return;
      const isDarkMode = document.documentElement.classList.contains("dark");
      const chartTitlePlugin = chartInstance.options.plugins.title;
      if (chartTitlePlugin)
        chartTitlePlugin.color = isDarkMode ? "#FFF" : "#374151";
      const xScale = chartInstance.options.scales.x as
        | CartesianScaleOptions
        | undefined;
      const yScale = chartInstance.options.scales.y as
        | CartesianScaleOptions
        | undefined;
      if (xScale) {
        if (xScale.title)
          xScale.title.color = isDarkMode ? "#9CA3AF" : "#6B7280";
        if (xScale.ticks)
          xScale.ticks.color = isDarkMode ? "#D1D5DB" : "#4B5563";
        if (xScale.grid)
          xScale.grid.color = isDarkMode
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";
      }
      if (yScale) {
        if (yScale.title)
          yScale.title.color = isDarkMode ? "#9CA3AF" : "#6B7280";
        if (yScale.ticks)
          yScale.ticks.color = isDarkMode ? "#D1D5DB" : "#4B5563";
        if (yScale.grid)
          yScale.grid.color = isDarkMode
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";
      }
      chartInstance.update("none");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handlePrev = () => setDateOffset((p) => p - 1);
  const handleNext = () => setDateOffset((p) => p + 1);

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg h-[500px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const showTimeNavCtrl =
    !isCustomDateRangeActive &&
    (selectedTimeRange === "Weekly" || selectedTimeRange === "Monthly");

  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-700 p-4 sm:p-6 rounded-xl">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-1 text-center sm:text-left">
          Working Capital Analysis
        </h3>
        <p className="text-sm text-dark dark:text-light mb-4 text-center sm:text-left">
          View Net Working Capital (Current Assets - Current Liabilities) over
          time.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start gap-3 sm:gap-4 my-4">
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Input
              id="start-date"
              label="Start Date"
              type="date"
              value={
                startDate && isValidDate(startDate)
                  ? format(startDate, "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) => handleStartDateChange(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
            <Input
              id="end-date"
              label="End Date"
              type="date"
              value={
                endDate && isValidDate(endDate)
                  ? format(endDate, "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) => handleEndDateChange(e.target.value)}
              placeholder="YYYY-MM-DD"
              disabled={!startDate || !isValidDate(startDate)}
            />
          </div>
          {!isCustomDateRangeActive && (
            <div className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px]">
              <Dropdown
                label="Time Range"
                items={TIME_RANGE_OPTIONS.slice()}
                selectedItem={selectedTimeRange}
                onSelect={(i) => {
                  setSelectedTimeRange(i as TimeRange);
                  setStartDate(null);
                  setEndDate(null);
                }}
                placeholder="Select Time Range"
              />
            </div>
          )}
        </div>
      </div>
      <div className="relative h-72 sm:h-80 md:h-96">
        <canvas ref={chartRef}></canvas>
      </div>
      {showTimeNavCtrl && (
        <div className="flex justify-center items-center gap-x-3 mt-4">
          <Button
            label="Previous"
            icon={{ left: "chevron_left" }}
            variant="ghost"
            disabled={isPrevDisabled}
            onClick={handlePrev}
          />{" "}
          <Button
            label="Next"
            icon={{ right: "chevron_right" }}
            variant="ghost"
            disabled={isNextDisabled}
            onClick={handleNext}
          />
        </div>
      )}
    </div>
  );
};

export default WorkingCapital;

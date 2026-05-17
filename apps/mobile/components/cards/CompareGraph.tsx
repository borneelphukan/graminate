import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isValid as isValidDate,
  startOfMonth,
  subDays as subDaysDateFns,
  subMonths,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
} from "@/components/ui";

export type DailyFinancialEntry = {
  date: Date;
  revenue: { total: number };
  cogs: { total: number };
  grossProfit: { total: number };
  expenses: { total: number };
  netProfit: { total: number };
};

const FINANCIAL_METRICS = [
  "Revenue",
  "COGS",
  "Gross Profit",
  "Expenses",
  "Net Profit",
] as const;
type FinancialMetric = (typeof FINANCIAL_METRICS)[number];

const TIME_RANGE_OPTIONS = ["Weekly", "Monthly", "3 Months"] as const;
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number];

const METRIC_COLORS: Record<FinancialMetric, string> = {
  Revenue: "rgba(34, 197, 94, 1)",
  COGS: "rgba(234, 179, 8, 1)",
  "Gross Profit": "rgba(6, 182, 212, 1)",
  Expenses: "rgba(239, 68, 68, 1)",
  "Net Profit": "rgba(59, 130, 246, 1)",
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const metricToKeyMap: Record<
  FinancialMetric,
  keyof Omit<DailyFinancialEntry, "date">
> = {
  Revenue: "revenue",
  COGS: "cogs",
  "Gross Profit": "grossProfit",
  Expenses: "expenses",
  "Net Profit": "netProfit",
};

const ITEMS_PER_PAGE = 7;

type CompareGraphProps = {
  initialFullHistoricalData: DailyFinancialEntry[];
  isLoadingData: boolean;
};

const PaperMenuDropdown = ({ label, items, selectedValue, onSelect }: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          icon="chevron-down"
          className="flex-row-reverse justify-between"
        >
          {`${label}: ${selectedValue}`}
        </Button>
      }
    >
      {items.map((item: string) => (
        <Menu.Item
          key={item}
          title={item}
          onPress={() => {
            onSelect(item);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
};

const CompareGraph = ({
  initialFullHistoricalData,
  isLoadingData,
}: CompareGraphProps) => {
  const [selectedMetric1, setSelectedMetric1] =
    useState<FinancialMetric>("Revenue");
  const [selectedMetric2, setSelectedMetric2] =
    useState<FinancialMetric>("COGS");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("Monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTimeRange, startDate, endDate, selectedMetric1, selectedMetric2]);

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

  const currentIntervalDates = useMemo(() => {
    if (initialFullHistoricalData.length === 0 && !isCustomDateRangeActive)
      return [];
    let vS: Date, vE: Date;
    if (isCustomDateRangeActive && startDate && endDate) {
      vS = startDate;
      vE = endDate;
    } else {
      const rD = today;
      if (selectedTimeRange === "Weekly") {
        vS = subDaysDateFns(rD, 6);
        vE = rD;
      } else if (selectedTimeRange === "Monthly") {
        const tMD = startOfMonth(rD);
        vS = tMD;
        vE = endOfMonth(tMD);
      } else {
        vS = startOfMonth(subMonths(rD, 2));
        vE = endOfMonth(rD);
      }
    }
    return eachDayOfInterval({ start: vS, end: vE });
  }, [
    isCustomDateRangeActive,
    startDate,
    endDate,
    selectedTimeRange,
    initialFullHistoricalData,
  ]);

  const chartData = useMemo(() => {
    if (currentIntervalDates.length === 0)
      return { labels: [], datasets: [], legend: [] };
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedDates = currentIntervalDates.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const labels: string[] = [];
    const data1: number[] = [];
    const data2: number[] = [];

    paginatedDates.forEach((day) => {
      labels.push(format(day, "MMM d"));
      const dataPoint = initialFullHistoricalData.find((fd) =>
        isSameDay(fd.date, day)
      );
      data1.push(
        Math.abs(dataPoint?.[metricToKeyMap[selectedMetric1]]?.total ?? 0)
      );
      data2.push(
        Math.abs(dataPoint?.[metricToKeyMap[selectedMetric2]]?.total ?? 0)
      );
    });

    return {
      labels,
      legend: [selectedMetric1, selectedMetric2],
      datasets: [
        {
          data: data1,
          color: (opacity = 1) =>
            METRIC_COLORS[selectedMetric1].replace(/, 1\)/, `, ${opacity})`),
        },
        {
          data: data2,
          color: (opacity = 1) =>
            METRIC_COLORS[selectedMetric2].replace(/, 1\)/, `, ${opacity})`),
        },
      ],
    };
  }, [
    selectedMetric1,
    selectedMetric2,
    currentIntervalDates,
    initialFullHistoricalData,
    currentPage,
  ]);

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray-400
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray-400
    formatYLabel: (y: string) =>
      new Intl.NumberFormat("en-IN", {
        notation: "compact",
        compactDisplay: "short",
      }).format(Number(y)),
  };

  if (isLoadingData) {
    return (
      <Card className="h-96 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Card>
    );
  }

  const handleDateChange =
    (setter: (date: Date | null) => void) => (text: string) => {
      const parsedDate = new Date(text);
      if (isValidDate(parsedDate) && text.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setter(parsedDate);
      } else if (text === "") {
        setter(null);
      }
    };

  const totalPages = Math.ceil(currentIntervalDates.length / ITEMS_PER_PAGE);

  return (
    <Card>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-center">
          {selectedMetric1} vs {selectedMetric2}
        </Text>
        <Text
          className="text-center mb-4"
        >
          Compare two financial metrics over time.
        </Text>

        <View className="gap-3 mb-6">
          <PaperMenuDropdown
            label="Metric 1"
            items={FINANCIAL_METRICS.filter((m) => m !== selectedMetric2)}
            selectedValue={selectedMetric1}
            onSelect={(val: any) => setSelectedMetric1(val)}
          />
          <PaperMenuDropdown
            label="Metric 2"
            items={FINANCIAL_METRICS.filter((m) => m !== selectedMetric1)}
            selectedValue={selectedMetric2}
            onSelect={(val: any) => setSelectedMetric2(val)}
          />
          <TextInput
            mode="outlined"
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={startDate ? format(startDate, "YYYY-MM-DD") : ""}
            onChangeText={handleDateChange(setStartDate)}
            right={<TextInput.Icon icon="calendar" />}
            className="bg-transparent"
          />
          <TextInput
            mode="outlined"
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={endDate ? format(endDate, "YYYY-MM-DD") : ""}
            onChangeText={handleDateChange(setEndDate)}
            disabled={!startDate}
            right={<TextInput.Icon icon="calendar" />}
            className="bg-transparent"
          />
          {!isCustomDateRangeActive && (
            <PaperMenuDropdown
              label="Time Range"
              items={TIME_RANGE_OPTIONS}
              selectedValue={selectedTimeRange}
              onSelect={(range: any) => setSelectedTimeRange(range)}
            />
          )}
        </View>

        <View className="items-center gap-2">
          {chartData.labels.length > 0 ? (
            <>
              <BarChart
                data={chartData}
                width={Dimensions.get("window").width - 50}
                height={250}
                yAxisLabel="₹"
                yAxisSuffix=""
                fromZero
                chartConfig={chartConfig}
                style={{
                  marginVertical: 16,
                  borderRadius: 16,
                }}
              />
              <Text
                variant="labelMedium"
                className="text-center text-gray-500"
              >
                Timeline
              </Text>
              {totalPages > 1 && (
                <View className="flex-row justify-center items-center gap-2 mt-2">
                  <Button
                    icon="chevron-left"
                    mode="text"
                    onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Prev
                  </Button>
                  <Button
                    icon="chevron-right"
                    mode="text"
                    onPress={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="flex-row-reverse"
                  >
                    Next
                  </Button>
                </View>
              )}
            </>
          ) : (
            <View className="h-64 w-full items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900">
              <Text className="text-gray-500">
                No data available for this period.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Card>
  );
};

export default CompareGraph;

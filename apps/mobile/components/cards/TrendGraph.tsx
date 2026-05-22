import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isValid as isValidDate,
  min as minDateFn,
  startOfMonth,
  subDays as subDaysDateFns,
  subMonths,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
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
  revenue: { total: number; breakdown: { name: string; value: number }[] };
  cogs: { total: number; breakdown: { name: string; value: number }[] };
  grossProfit: { total: number; breakdown: { name: string; value: number }[] };
  expenses: { total: number; breakdown: { name: string; value: number }[] };
  netProfit: { total: number; breakdown: { name: string; value: number }[] };
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

const CHART_COLORS = [
  "rgba(75, 192, 192, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(128,128,128, 1)",
  "rgba(239, 68, 68, 1)",
  "rgba(34, 197, 94, 1)",
  "rgba(234, 179, 8, 1)",
  "rgba(6, 182, 212, 1)",
  "rgba(59, 130, 246, 1)",
];

const ITEMS_PER_PAGE = 7;
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

type TrendGraphProps = {
  initialFullHistoricalData: DailyFinancialEntry[];
  initialSubTypes: string[];
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

const TrendGraph = ({
  initialFullHistoricalData,
  initialSubTypes,
  isLoadingData,
}: TrendGraphProps) => {
  const [selectedMetric, setSelectedMetric] =
    useState<FinancialMetric>("Revenue");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("Monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedMetric, selectedTimeRange, startDate, endDate]);

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
    if (initialFullHistoricalData.length === 0) return [];
    let vS: Date, vE: Date;
    if (isCustomDateRangeActive && startDate && endDate) {
      vS = startDate;
      vE = endDate;
    } else {
      if (selectedTimeRange === "Weekly") {
        vE = today;
        vS = subDaysDateFns(vE, 6);
      } else if (selectedTimeRange === "Monthly") {
        const tMD = today;
        vS = startOfMonth(tMD);
        vE = endOfMonth(tMD);
      } else {
        vS = startOfMonth(subMonths(today, 2));
        vE = minDateFn([today, endOfMonth(today)]);
      }
    }
    return eachDayOfInterval({ start: vS, end: vE });
  }, [
    isCustomDateRangeActive,
    startDate,
    endDate,
    selectedTimeRange,
    initialFullHistoricalData.length,
  ]);

  const totalPages = Math.ceil(currentIntervalDates.length / ITEMS_PER_PAGE);

  const { lineChartData } = useMemo(() => {
    if (currentIntervalDates.length === 0)
      return { lineChartData: { labels: [], datasets: [], legend: [] } };
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedDates = currentIntervalDates.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const metricKey = metricToKeyMap[selectedMetric];
    let lineLabels: string[] = [];
    const lineDatasets = initialSubTypes.map(() => ({ data: [] as number[] }));

    paginatedDates.forEach((day) => {
      lineLabels.push(format(day, "MMM d"));
      const dataPoint = initialFullHistoricalData.find((fd) =>
        isSameDay(fd.date, day)
      );
      initialSubTypes.forEach((sub, i) => {
        const val =
          dataPoint?.[metricKey]?.breakdown.find((b) => b.name === sub)
            ?.value ?? 0;
        lineDatasets[i].data.push(val);
      });
    });

    return {
      lineChartData: {
        labels: lineLabels,
        datasets: initialSubTypes.map((sub, i) => ({
          data: lineDatasets[i].data,
          color: (opacity = 1) =>
            CHART_COLORS[i % CHART_COLORS.length].replace(
              /, 1\)/,
              `, ${opacity})`
            ),
          strokeWidth: 2,
        })),
        legend: initialSubTypes,
      },
    };
  }, [
    selectedMetric,
    currentIntervalDates,
    initialSubTypes,
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
    propsForLabels: { fontSize: 10, fontWeight: "bold" },
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

  return (
    <Card>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-left text-xl font-extrabold text-dark dark:text-light mb-1">
          Financial Trends
        </Text>
        <Text className="text-left text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select a metric and time range to analyze.
        </Text>

        <View className="gap-3 mb-6">
          <PaperMenuDropdown
            label="Metric"
            items={FINANCIAL_METRICS}
            selectedValue={selectedMetric}
            onSelect={(item: any) => setSelectedMetric(item)}
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
              onSelect={(item: any) => setSelectedTimeRange(item)}
            />
          )}
        </View>

        <View className="items-center gap-2">
          <Text className="text-center">
            {selectedMetric} Trend
          </Text>
          {lineChartData.labels.length > 0 ? (
            <>
              <LineChart
                data={lineChartData}
                width={Dimensions.get("window").width - 50}
                height={250}
                yAxisLabel="₹"
                chartConfig={chartConfig}
                bezier
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

export default TrendGraph;

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
import { BarChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
} from "@/components/ui";

const TIME_RANGE_OPTIONS = ["Weekly", "Monthly", "3 Months"] as const;
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number];

const ITEMS_PER_PAGE = 7;

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

export type DailyFinancialEntry = {
  date: Date;
  revenue: { total: number };
  cogs: { total: number };
  grossProfit: { total: number };
  expenses: { total: number };
  netProfit: { total: number };
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
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("Monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fullHistoricalWorkingCapitalData = useMemo(() => {
    let cumulativeBalance = openingBalance;
    return initialFullHistoricalData.map((entry: DailyFinancialEntry) => {
      const dailyAssets = entry.revenue.total;
      const dailyLiabilities = entry.cogs.total + entry.expenses.total;
      const dailyNetFlow = dailyAssets - dailyLiabilities;

      cumulativeBalance += dailyNetFlow;

      return {
        date: entry.date,
        currentAssets: dailyAssets,
        currentLiabilities: dailyLiabilities,
        netWorkingCapital: parseFloat(cumulativeBalance.toFixed(2)),
      };
    });
  }, [initialFullHistoricalData, openingBalance]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTimeRange, startDate, endDate]);

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
    if (fullHistoricalWorkingCapitalData.length === 0) return [];
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
        vS = startOfMonth(rD);
        vE = endOfMonth(rD);
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
    today,
    fullHistoricalWorkingCapitalData,
  ]);

  const chartData = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedDates = currentIntervalDates.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const labels: string[] = [];
    const dataPoints: number[] = [];
    paginatedDates.forEach((day) => {
      const dataPoint = fullHistoricalWorkingCapitalData.find((d: any) =>
        isSameDay(d.date, day)
      );
      labels.push(format(day, "MMM d"));
      dataPoints.push(dataPoint ? dataPoint.netWorkingCapital : 0);
    });
    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        },
      ],
    };
  }, [currentIntervalDates, currentPage, fullHistoricalWorkingCapitalData]);

  if (isLoadingData) {
    return (
      <Card className="h-96 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Card>
    );
  }

  const totalPages = Math.ceil(currentIntervalDates.length / ITEMS_PER_PAGE);

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
        <Text className="text-center">
          Working Capital Analysis
        </Text>
        <Text
          className="text-center mb-4"
        >
          Net Working Capital (Current Assets - Current Liabilities)
        </Text>

        <View className="gap-3 mb-6">
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

        <View className="items-center gap-2 mt-4">
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
            </>
          ) : (
            <View className="h-64 w-full items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900">
              <Text className="text-gray-500">
                No data available for this period.
              </Text>
            </View>
          )}
        </View>

        {totalPages > 1 && (
          <View className="flex-row justify-center items-center gap-2 mt-4">
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
      </ScrollView>
    </Card>
  );
};

export default WorkingCapital;

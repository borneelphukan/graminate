import {
  format,
  isValid as isValidDate,
  isBefore,
  eachDayOfInterval,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
} from "@/components/ui";
import { DailyFinancialEntry } from "./WorkingCapital";

const TIME_RANGE_OPTIONS = ["Weekly", "Monthly", "3 Months"] as const;
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number];

const CHART_TYPES = ["Debt Trend", "Debt Breakdown"] as const;
type ChartType = (typeof CHART_TYPES)[number];

const ITEMS_PER_PAGE = 7;

const PaperMenuDropdown = ({ label, items, selectedValue, onSelect, icon = "chevron-down" }: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          icon={icon}
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
};

type DebtAnalysisProps = {
  initialFullHistoricalData: DailyFinancialEntry[];
  loans: any[];
  isLoadingData: boolean;
};

const DebtAnalysis = ({
  initialFullHistoricalData,
  loans,
  isLoadingData,
}: DebtAnalysisProps) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>("Debt Trend");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("Monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTimeRange, startDate, endDate, selectedChartType]);

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
      const rD = today;
      if (selectedTimeRange === "Weekly") {
        vS = subDays(rD, 6);
        vE = rD;
      } else if (selectedTimeRange === "Monthly") {
        vS = startOfMonth(rD);
        vE = endOfMonth(rD);
      } else {
        vS = startOfMonth(subMonths(rD, 2));
        vE = rD;
      }
    }
    return eachDayOfInterval({ start: vS, end: vE });
  }, [isCustomDateRangeActive, startDate, endDate, selectedTimeRange, today, initialFullHistoricalData]);

  const totalPages = Math.ceil(currentIntervalDates.length / ITEMS_PER_PAGE);

  const lineData = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedDates = currentIntervalDates.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const labels = paginatedDates.map((d) => format(d, "MMM d"));
    
    const dataPoints = paginatedDates.map((day) => {
      return loans.reduce((sum, loan) => {
        const startDate = new Date(loan.start_date);
        const endDate = loan.end_date ? new Date(loan.end_date) : null;
        
        if (day >= startDate && (!endDate || day <= endDate)) {
          return sum + Number(loan.amount);
        }
        return sum;
      }, 0);
    });

    return {
      labels,
      datasets: [{ data: dataPoints }],
    };
  }, [currentIntervalDates, currentPage, loans]);

  const pieData = useMemo(() => {
    return loans.map((d, index) => ({
      name: d.loan_name,
      population: Number(d.amount),
      color: ["#EF4444", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6"][index % 5],
      legendFontColor: "#9ca3af", // gray-400
      legendFontSize: 12,
    }));
  }, [loans]);

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray-400
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#EF4444",
    },
    formatYLabel: (y: string) => formatCurrency(Number(y)),
  };

  const handleDateChange = (setter: (date: Date | null) => void) => (text: string) => {
    const parsedDate = new Date(text);
    if (isValidDate(parsedDate) && text.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setter(parsedDate);
    } else if (text === "") {
      setter(null);
    }
  };

  if (isLoadingData) {
    return (
      <Card className="h-96 items-center justify-center p-4">
        <ActivityIndicator size="large" />
      </Card>
    );
  }

  return (
    <Card>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-center">
          Loans & Debt Analysis
        </Text>
        <Text className="text-center mb-4 text-gray-500">
          Outstanding Liabilities & Repayment Trends
        </Text>

        <View className="gap-3 mb-6">
          <TextInput
            mode="outlined"
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
            onChangeText={handleDateChange(setStartDate)}
            right={<TextInput.Icon icon="calendar" />}
            className="bg-transparent"
          />
          <TextInput
            mode="outlined"
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            onChangeText={handleDateChange(setEndDate)}
            disabled={!startDate}
            right={<TextInput.Icon icon="calendar" />}
            className="bg-transparent"
          />
          
          <View className="flex-row gap-2">
            <View className="flex-1">
              <PaperMenuDropdown
                label="Analysis"
                items={CHART_TYPES}
                selectedValue={selectedChartType}
                onSelect={(v: any) => setSelectedChartType(v)}
                icon="chart-bar"
              />
            </View>
            {!isCustomDateRangeActive && selectedChartType === "Debt Trend" && (
              <View className="flex-1">
                <PaperMenuDropdown
                  label="Range"
                  items={TIME_RANGE_OPTIONS}
                  selectedValue={selectedTimeRange}
                  onSelect={(v: any) => setSelectedTimeRange(v)}
                />
              </View>
            )}
          </View>
        </View>

        <View className="items-center gap-2 mt-4">
          {selectedChartType === "Debt Trend" ? (
            lineData.labels.length > 0 ? (
              <>
                <LineChart
                  data={lineData}
                  width={Dimensions.get("window").width - 50}
                  height={250}
                  chartConfig={chartConfig}
                  bezier
                  style={{
                    marginVertical: 16,
                    borderRadius: 16,
                  }}
                />
                <Text className="text-center text-gray-500">
                  Timeline
                </Text>
              </>
            ) : (
              <View className="h-64 w-full items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900">
                <Text className="text-gray-500">No data available for this period.</Text>
              </View>
            )
          ) : (
            pieData.length > 0 ? (
              <PieChart
                data={pieData}
                width={Dimensions.get("window").width - 50}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View className="h-64 w-full items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900">
                <Text className="text-gray-500">No active loans found.</Text>
              </View>
            )
          )}
        </View>

        {selectedChartType === "Debt Trend" && totalPages > 1 && (
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
              onPress={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
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

export default DebtAnalysis;

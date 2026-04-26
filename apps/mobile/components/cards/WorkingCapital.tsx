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
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

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
          contentStyle={styles.dropdownButton}
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
  const theme = useTheme();
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
      <Card style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </Card>
    );
  }

  const totalPages = Math.ceil(currentIntervalDates.length / ITEMS_PER_PAGE);

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `rgba(${theme.dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    labelColor: (opacity = 1) =>
      `rgba(${theme.dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.centeredText}>
          Working Capital Analysis
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.centeredText, styles.subtitle]}
        >
          Net Working Capital (Current Assets - Current Liabilities)
        </Text>

        <View style={styles.controlsContainer}>
          <TextInput
            mode="outlined"
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={startDate ? format(startDate, "YYYY-MM-DD") : ""}
            onChangeText={handleDateChange(setStartDate)}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={endDate ? format(endDate, "YYYY-MM-DD") : ""}
            onChangeText={handleDateChange(setEndDate)}
            disabled={!startDate}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
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

        <View style={styles.chartSection}>
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
                style={styles.chart}
              />
              <Text
                variant="labelMedium"
                style={[
                  styles.centeredText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Timeline
              </Text>
            </>
          ) : (
            <View
              style={[
                styles.noDataContainer,
                {
                  borderColor: theme.colors.outline,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                No data available for this period.
              </Text>
            </View>
          )}
        </View>

        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
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
              contentStyle={styles.nextButton}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    height: 384,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: { padding: 16 },
  centeredText: { textAlign: "center" },
  subtitle: { marginBottom: 16 },
  controlsContainer: { gap: 12, marginBottom: 24 },
  dropdownButton: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  input: { backgroundColor: "transparent" },
  chartSection: { alignItems: "center", gap: 8, marginTop: 16 },
  chart: { marginVertical: 16, borderRadius: 16 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  nextButton: { flexDirection: "row-reverse" },
  noDataContainer: {
    height: 256,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    marginTop: 16,
  },
});

export default WorkingCapital;

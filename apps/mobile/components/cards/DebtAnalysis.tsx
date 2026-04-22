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
  useTheme,
} from "react-native-paper";
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
  const theme = useTheme();
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
      legendFontColor: theme.dark ? "#D1D5DB" : "#4B5563",
      legendFontSize: 12,
    }));
  }, [loans, theme.dark]);

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
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
      <Card style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </Card>
    );
  }

  return (
    <Card>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.centeredText}>
          Loans & Debt Analysis
        </Text>
        <Text variant="bodyMedium" style={[styles.centeredText, styles.subtitle]}>
          Outstanding Liabilities & Repayment Trends
        </Text>

        <View style={styles.controlsContainer}>
          <TextInput
            mode="outlined"
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
            onChangeText={handleDateChange(setStartDate)}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            onChangeText={handleDateChange(setEndDate)}
            disabled={!startDate}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
          />
          
          <View style={styles.dropdownRow}>
            <View style={{ flex: 1 }}>
              <PaperMenuDropdown
                label="Analysis"
                items={CHART_TYPES}
                selectedValue={selectedChartType}
                onSelect={(v: any) => setSelectedChartType(v)}
                icon="chart-bar"
              />
            </View>
            {!isCustomDateRangeActive && selectedChartType === "Debt Trend" && (
              <View style={{ flex: 1 }}>
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

        <View style={styles.chartSection}>
          {selectedChartType === "Debt Trend" ? (
            lineData.labels.length > 0 ? (
              <>
                <LineChart
                  data={lineData}
                  width={Dimensions.get("window").width - 50}
                  height={250}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
                <Text variant="labelMedium" style={[styles.centeredText, { color: theme.colors.onSurfaceVariant }]}>
                  Timeline
                </Text>
              </>
            ) : (
              <View style={[styles.noDataContainer, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No data available for this period.</Text>
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
              <View style={[styles.noDataContainer, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>No active loans found.</Text>
              </View>
            )
          )}
        </View>

        {selectedChartType === "Debt Trend" && totalPages > 1 && (
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
              onPress={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
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
  subtitle: { marginBottom: 16, color: "#6B7280" },
  controlsContainer: { gap: 12, marginBottom: 24 },
  dropdownRow: { flexDirection: "row", gap: 8 },
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

export default DebtAnalysis;

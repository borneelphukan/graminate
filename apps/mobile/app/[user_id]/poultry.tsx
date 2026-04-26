import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import { FLOCK_FIELDS, FlockFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import {
  addDays as addDaysDateFns,
  endOfMonth,
  format as formatDateFns,
  isWithinInterval,
  startOfMonth,
  subDays as subDaysDateFns,
} from "date-fns";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";

type SubTypeValue = { name: string; value: number };
export type MetricBreakdown = { total: number; breakdown: SubTypeValue[] };
export type DailyFinancialEntry = {
  date: Date;
  revenue: MetricBreakdown;
  cogs: MetricBreakdown;
  grossProfit: MetricBreakdown;
  expenses: MetricBreakdown;
  netProfit: MetricBreakdown;
};
type SaleRecord = {
  sales_id: number;
  user_id: number;
  sales_name?: string;
  sales_date: string;
  occupation?: string;
  items_sold: string[];
  quantities_sold: number[];
  prices_per_unit?: number[];
};
type ExpenseRecord = {
  expense_id: number;
  user_id: number;
  title: string;
  occupation?: string;
  category: string;
  expense: number;
  date_created: string;
};
type ProcessedExpensesForDay = {
  cogs: MetricBreakdown;
  expenses: MetricBreakdown;
};
type FlockApiData = {
  flock_id: number;
  flock_name: string;
  flock_type: string;
  quantity: number;
  breed?: string;
  source?: string;
  housing_type?: string;
};

const TOTAL_DAYS_FOR_HISTORICAL_DATA = 180;
const today = new Date();
today.setHours(0, 0, 0, 0);

const DETAILED_EXPENSE_CATEGORIES = {
  "Goods & Services": ["Farm Utilities", "Agricultural Feeds", "Consulting"],
  "Utility Expenses": [
    "Electricity",
    "Labour Salary",
    "Water Supply",
    "Taxes",
    "Others",
  ],
};

const categoryToMainGroup: Record<string, string> = {};
for (const mainGroup in DETAILED_EXPENSE_CATEGORIES) {
  DETAILED_EXPENSE_CATEGORIES[
    mainGroup as keyof typeof DETAILED_EXPENSE_CATEGORIES
  ].forEach((subCat) => {
    categoryToMainGroup[subCat] = mainGroup;
  });
}

const generateDailyFinancialData = (
  count: number,
  baseSubTypes: string[],
  actualSalesData?: Map<string, MetricBreakdown>,
  actualProcessedExpenses?: Map<string, ProcessedExpensesForDay>
): DailyFinancialEntry[] => {
  const data: DailyFinancialEntry[] = [];
  let loopDate = subDaysDateFns(today, count - 1);
  const finalOccupationsList =
    baseSubTypes.length > 0 ? baseSubTypes : ["Poultry"];
  for (let i = 0; i < count; i++) {
    const dateKey = formatDateFns(loopDate, "yyyy-MM-dd");
    const actualRevenueForDay = actualSalesData?.get(dateKey);
    const actualExpensesForDay = actualProcessedExpenses?.get(dateKey);
    const dailyEntry: Partial<DailyFinancialEntry> = {
      date: new Date(loopDate),
    };
    dailyEntry.revenue = actualRevenueForDay || {
      total: 0,
      breakdown: finalOccupationsList.map((occ) => ({ name: occ, value: 0 })),
    };
    dailyEntry.cogs = actualExpensesForDay?.cogs || {
      total: 0,
      breakdown: finalOccupationsList.map((occ) => ({ name: occ, value: 0 })),
    };
    dailyEntry.expenses = actualExpensesForDay?.expenses || {
      total: 0,
      breakdown: finalOccupationsList.map((occ) => ({ name: occ, value: 0 })),
    };
    const grossProfitTotal = dailyEntry.revenue.total - dailyEntry.cogs.total;
    const grossProfitBreakdown: SubTypeValue[] = finalOccupationsList.map(
      (occName) => ({
        name: occName,
        value:
          (dailyEntry.revenue!.breakdown.find((b) => b.name === occName)
            ?.value || 0) -
          (dailyEntry.cogs!.breakdown.find((b) => b.name === occName)?.value ||
            0),
      })
    );
    dailyEntry.grossProfit = {
      total: grossProfitTotal,
      breakdown: grossProfitBreakdown,
    };
    const netProfitTotal = grossProfitTotal - dailyEntry.expenses.total;
    dailyEntry.netProfit = {
      total: netProfitTotal,
      breakdown: grossProfitBreakdown.map((gp) => ({ ...gp })),
    };
    data.push(dailyEntry as DailyFinancialEntry);
    loopDate = addDaysDateFns(loopDate, 1);
  }
  return data;
};

const TARGET_POULTRY_SUB_TYPE = "Poultry";

const PoultryScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const theme = useTheme();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const navbarBg = "#1f2937"; // gray-800 (slightly lighter than navbar gray-900)
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#374151"; // gray-700

  const [flockRecords, setFlockRecords] = useState<FlockApiData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFlocks, setLoadingFlocks] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<
    DailyFinancialEntry[]
  >([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);

  const memoizedBackIcon = useCallback(
    () => (
      <Icon
        type={"arrow-left" as any}
        size={22}
        color={navbarIconColor}
      />
    ),
    [navbarIconColor]
  );

  const memoizedAddIcon = useCallback(
    () => (
      <Icon
        type={"plus" as any}
        size={22}
        color={navbarIconColor}
      />
    ),
    [navbarIconColor]
  );

  const processSalesData = useCallback(
    (sales: SaleRecord[]): Map<string, MetricBreakdown> => {
      return new Map();
    },
    []
  );
  const processExpensesData = useCallback(
    (expenses: ExpenseRecord[]): Map<string, ProcessedExpensesForDay> => {
      return new Map();
    },
    []
  );

  const fetchFinancialData = useCallback(async () => {
    if (!user_id) {
      setIsLoadingFinancials(false);
      return;
    }
    setIsLoadingFinancials(true);
    try {
      const [salesResponse, expensesResponse] = await Promise.all([
        axiosInstance.get<{ sales: SaleRecord[] }>(`/sales/user/${user_id}`),
        axiosInstance.get<{ expenses: ExpenseRecord[] }>(
          `/expenses/user/${user_id}`
        ),
      ]);
      const poultrySales = (salesResponse.data.sales || []).filter(
        (s) => s.occupation === TARGET_POULTRY_SUB_TYPE
      );
      const poultryExpenses = (expensesResponse.data.expenses || []).filter(
        (e) => e.occupation === TARGET_POULTRY_SUB_TYPE
      );
      const processedSales = processSalesData(poultrySales);
      const processedExpenses = processExpensesData(poultryExpenses);
      const generatedData = generateDailyFinancialData(
        TOTAL_DAYS_FOR_HISTORICAL_DATA,
        [TARGET_POULTRY_SUB_TYPE],
        processedSales,
        processedExpenses
      );
      setFullHistoricalData(generatedData);
    } catch {
      Alert.alert("Error", "Could not load poultry financial data.");
      setFullHistoricalData([]);
    } finally {
      setIsLoadingFinancials(false);
    }
  }, [user_id, processSalesData, processExpensesData]);

  const fetchFlocks = useCallback(async () => {
    if (!user_id) {
      setLoadingFlocks(false);
      return;
    }
    setLoadingFlocks(true);
    try {
      const response = await axiosInstance.get(`/flock/user/${user_id}`);
      setFlockRecords(response.data.flocks || []);
    } catch {
      setFlockRecords([]);
    } finally {
      setLoadingFlocks(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchFlocks();
      fetchFinancialData();
    }, [fetchFlocks, fetchFinancialData])
  );

  const handleAddFlock = async (formData: FlockFormData) => {
    if (!numericUserId) return;
    try {
      const payload = {
        ...formData,
        user_id: numericUserId,
        quantity: Number(formData.quantity),
      };
      await axiosInstance.post("/flock", payload);
      await fetchFlocks();
    } catch {
    }
  };

  const handleRowClick = (item: FlockApiData) =>
    router.push(`/${user_id}/poultry/${item.flock_id}`);

  const currentMonthPoultryCardData = useMemo(() => {
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    let totals = { revenue: 0, cogs: 0, expenses: 0 };
    fullHistoricalData.forEach((entry) => {
      if (
        isWithinInterval(entry.date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        totals.revenue += entry.revenue.total;
        totals.cogs += entry.cogs.total;
        totals.expenses += entry.expenses.total;
      }
    });
    const grossProfit = totals.revenue - totals.cogs;
    const netProfit = grossProfit - totals.expenses;
    const isDark = theme.dark;
    return [
      {
        title: "Poultry Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        bgColor: isDark ? "#14532d" : "#dcfce7",
        iconValueColor: isDark ? "#86efac" : "#16a34a",
      },
      {
        title: "Poultry COGS",
        value: totals.cogs,
        icon: "shopping-outline",
        bgColor: isDark ? "#713f12" : "#fef3c7",
        iconValueColor: isDark ? "#fcd34d" : "#b45309",
      },
      {
        title: "Poultry Gross Profit",
        value: grossProfit,
        icon: "chart-pie",
        bgColor: isDark ? "#164e63" : "#cffafe",
        iconValueColor: isDark ? "#67e8f9" : "#0891b2",
      },
      {
        title: "Poultry Expenses",
        value: totals.expenses,
        icon: "credit-card-outline",
        bgColor: isDark ? "#7f1d1d" : "#fee2e2",
        iconValueColor: isDark ? "#fca5a5" : "#b91c1c",
      },
      {
        title: "Poultry Net Profit",
        value: netProfit,
        icon: "bank-outline",
        bgColor: isDark ? "#1e3a8a" : "#dbeafe",
        iconValueColor: isDark ? "#93c5fd" : "#2563eb",
      },
    ];
  }, [fullHistoricalData, theme.dark]);

  const filteredFlockRecords = useMemo(() => {
    if (!searchQuery) return flockRecords;
    return flockRecords.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [flockRecords, searchQuery]);

  return (
    <PlatformLayout>
      <Appbar.Header
        style={{
          backgroundColor: navbarBg,
          borderBottomWidth: 1,
          borderBottomColor: navbarBorder,
        }}
      >
        <Appbar.Action
          icon={memoizedBackIcon}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Poultry Flocks"
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitle={
            loadingFlocks
              ? "Loading..."
              : `${filteredFlockRecords.length} Record(s)`
          }
          subtitleStyle={{ color: navbarIconColor }}
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => setIsFormVisible(true)}
        />
      </Appbar.Header>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.toggleContainer}>
          <Button
            icon={() => (
              <Icon
                type={(showFinancials ? "chevron-up" : "chevron-down") as any}
                size={16}
                color={theme.colors.primary}
              />
            )}
            onPress={() => setShowFinancials(!showFinancials)}
          >
            {showFinancials ? "Hide Finances" : "Show Finances"}
          </Button>
        </View>
        {showFinancials &&
          (isLoadingFinancials ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <View style={styles.cardGrid}>
              {currentMonthPoultryCardData.map((card, index) => (
                <View
                  key={index}
                  style={
                    index === currentMonthPoultryCardData.length - 1
                      ? styles.fullWidthCard
                      : styles.halfWidthCard
                  }
                >
                  <BudgetCard {...card} date={today} />
                </View>
              ))}
            </View>
          ))}
        <Searchbar
          placeholder="Search Flocks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
        <View style={styles.listContainer}>
          {loadingFlocks ? (
            <ActivityIndicator style={styles.loader} />
          ) : filteredFlockRecords.length > 0 ? (
            filteredFlockRecords.map((item) => (
              <Card
                key={item.flock_id}
                onPress={() => handleRowClick(item)}
                style={styles.flockCard}
              >
                <Card.Title title={item.flock_name} titleVariant="titleLarge" />
                <Card.Content>
                  <View style={styles.cardDetails}>
                    <Text variant="bodyMedium">Type: {item.flock_type}</Text>
                    <Text variant="bodyMedium">Qty: {item.quantity}</Text>
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Breed: {item.breed || "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No flocks found. Tap &apos;+&apos; to get started.
            </Text>
          )}
        </View>
        <View style={styles.projectSection}>
          <View style={styles.projectHeader}>
            <Text variant="headlineSmall" style={styles.projectTitle}>
              Your Poultry Tasks
            </Text>
            <Text variant="bodyMedium" style={styles.projectSubtitle}>
              All your poultry tasks visualized
            </Text>
          </View>
          <View style={styles.projectBoardContainer}>
            {numericUserId > 0 && (
              <ProjectTaskBoard userId={numericUserId} projectTitle="Poultry" />
            )}
          </View>
        </View>

        <View style={styles.widgetContainer}>
          {user_id && (
            <WarehouseWidget userId={user_id} serviceName="Poultry" />
          )}
        </View>
      </ScrollView>
      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddFlock}
        title="Add New Flock"
        fields={FLOCK_FIELDS}
      />
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loader: { marginVertical: 16 },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  halfWidthCard: {
    width: "48%",
  },
  fullWidthCard: {
    width: "100%",
  },
  searchbar: { marginHorizontal: 16, marginBottom: 16 },
  listContainer: { paddingHorizontal: 16 },
  flockCard: { marginBottom: 12 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emptyText: { textAlign: "center", marginTop: 40, padding: 16 },
  widgetContainer: { gap: 16, marginTop: 16 },
  projectSection: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  projectHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  projectTitle: {
    fontWeight: "bold",
  },
  projectSubtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  projectBoardContainer: {
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
});

export default PoultryScreen;

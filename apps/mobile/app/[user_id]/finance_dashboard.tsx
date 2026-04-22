import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import CompareGraph from "@/components/cards/CompareGraph";
import TrendGraph from "@/components/cards/TrendGraph";
import WorkingCapital from "@/components/cards/WorkingCapital";
import DebtAnalysis from "@/components/cards/DebtAnalysis";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import {
  addDays as addDaysDateFns,
  endOfMonth,
  format as formatDateFns,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subDays as subDaysDateFns,
} from "date-fns";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";

const TOTAL_DAYS_FOR_HISTORICAL_DATA = 180;
const today = new Date();
today.setHours(0, 0, 0, 0);

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
const EXPENSE_TYPE_MAP = {
  COGS: "Goods & Services",
  OPERATING_EXPENSES: "Utility Expenses",
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

  const allOccupations = new Set<string>(baseSubTypes);
  if (actualSalesData) {
    actualSalesData.forEach((dayData) =>
      dayData.breakdown.forEach((bd) => allOccupations.add(bd.name))
    );
  }
  if (actualProcessedExpenses) {
    actualProcessedExpenses.forEach((dayData) => {
      dayData.cogs.breakdown.forEach((bd) => allOccupations.add(bd.name));
      dayData.expenses.breakdown.forEach((bd) => allOccupations.add(bd.name));
    });
  }
  if (allOccupations.size === 0 && baseSubTypes.length === 0) {
    allOccupations.add("Uncategorized");
  }
  const finalOccupationsList = Array.from(allOccupations);

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
      (occName) => {
        const revVal =
          dailyEntry.revenue!.breakdown.find((b) => b.name === occName)
            ?.value || 0;
        const cogsVal =
          dailyEntry.cogs!.breakdown.find((b) => b.name === occName)?.value ||
          0;
        return { name: occName, value: revVal - cogsVal };
      }
    );
    dailyEntry.grossProfit = {
      total: grossProfitTotal,
      breakdown: grossProfitBreakdown,
    };

    const netProfitTotal = grossProfitTotal - dailyEntry.expenses.total;
    const netProfitBreakdown: SubTypeValue[] = finalOccupationsList.map(
      (occName) => {
        const gpVal =
          grossProfitBreakdown.find((b) => b.name === occName)?.value || 0;
        const expVal =
          dailyEntry.expenses!.breakdown.find((b) => b.name === occName)
            ?.value || 0;
        return { name: occName, value: gpVal - expVal };
      }
    );
    dailyEntry.netProfit = {
      total: netProfitTotal,
      breakdown: netProfitBreakdown,
    };

    data.push(dailyEntry as DailyFinancialEntry);
    loopDate = addDaysDateFns(loopDate, 1);
  }
  return data;
};

const FinanceDashboardScreen = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const navigation = useNavigation();
  const theme = useTheme();
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<
    DailyFinancialEntry[]
  >([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  useEffect(() => {
    navigation.setOptions({ title: "Finance Dashboard" });
  }, [navigation]);

  const processSalesData = useCallback(
    (
      sales: SaleRecord[],
      userSubTypes: string[]
    ): Map<string, MetricBreakdown> => {
      const dailyRevenueMap = new Map<string, MetricBreakdown>();
      const occupationsEncountered = new Set<string>(userSubTypes);

      sales.forEach((sale) => {
        const occupation = sale.occupation || "Uncategorized";
        occupationsEncountered.add(occupation);
      });
      const allRelevantOccupations = Array.from(occupationsEncountered);

      sales.forEach((sale) => {
        const saleDate = parseISO(sale.sales_date);
        const saleDateStr = formatDateFns(saleDate, "yyyy-MM-dd");

        let totalSaleAmount = 0;
        if (
          sale.items_sold &&
          sale.quantities_sold &&
          sale.prices_per_unit &&
          sale.items_sold.length === sale.quantities_sold.length &&
          sale.items_sold.length === sale.prices_per_unit.length
        ) {
          for (let i = 0; i < sale.items_sold.length; i++) {
            totalSaleAmount +=
              (sale.quantities_sold[i] || 0) * (sale.prices_per_unit[i] || 0);
          }
        }

        const occupation = sale.occupation || "Uncategorized";

        if (!dailyRevenueMap.has(saleDateStr)) {
          dailyRevenueMap.set(saleDateStr, {
            total: 0,
            breakdown: allRelevantOccupations.map((st) => ({
              name: st,
              value: 0,
            })),
          });
        }

        const dayData = dailyRevenueMap.get(saleDateStr)!;
        dayData.total += totalSaleAmount;

        const occupationEntry = dayData.breakdown.find(
          (b) => b.name === occupation
        );
        if (occupationEntry) {
          occupationEntry.value += totalSaleAmount;
        } else {
          const newOccEntry = { name: occupation, value: totalSaleAmount };
          dayData.breakdown.push(newOccEntry);
          if (!allRelevantOccupations.includes(occupation))
            allRelevantOccupations.push(occupation);
        }
      });
      return dailyRevenueMap;
    },
    []
  );

  const processExpensesData = useCallback(
    (
      expenses: ExpenseRecord[],
      userSubTypes: string[]
    ): Map<string, ProcessedExpensesForDay> => {
      const dailyExpensesMap = new Map<string, ProcessedExpensesForDay>();
      const occupationsEncountered = new Set<string>(userSubTypes);

      expenses.forEach((expense) => {
        const occupation = expense.occupation || "Uncategorized";
        occupationsEncountered.add(occupation);
      });
      const allRelevantOccupations = Array.from(occupationsEncountered);

      expenses.forEach((expense) => {
        const expenseDate = parseISO(expense.date_created);
        const expenseDateStr = formatDateFns(expenseDate, "yyyy-MM-dd");
        const expenseAmount = Number(expense.expense) || 0;
        const occupation = expense.occupation || "Uncategorized";

        const mainCategoryGroup = categoryToMainGroup[expense.category];
        let expenseType: "cogs" | "expenses" | null = null;

        if (mainCategoryGroup === EXPENSE_TYPE_MAP.COGS) {
          expenseType = "cogs";
        } else if (mainCategoryGroup === EXPENSE_TYPE_MAP.OPERATING_EXPENSES) {
          expenseType = "expenses";
        }

        if (!expenseType) return;

        if (!dailyExpensesMap.has(expenseDateStr)) {
          dailyExpensesMap.set(expenseDateStr, {
            cogs: {
              total: 0,
              breakdown: allRelevantOccupations.map((st) => ({
                name: st,
                value: 0,
              })),
            },
            expenses: {
              total: 0,
              breakdown: allRelevantOccupations.map((st) => ({
                name: st,
                value: 0,
              })),
            },
          });
        }

        const dayDataContainer = dailyExpensesMap.get(expenseDateStr)!;
        const targetMetricBreakdown = dayDataContainer[expenseType];

        targetMetricBreakdown.total += expenseAmount;
        const occupationEntry = targetMetricBreakdown.breakdown.find(
          (b) => b.name === occupation
        );

        if (occupationEntry) {
          occupationEntry.value += expenseAmount;
        } else {
          const newOccEntry = { name: occupation, value: expenseAmount };
          targetMetricBreakdown.breakdown.push(newOccEntry);
          if (!allRelevantOccupations.includes(occupation))
            allRelevantOccupations.push(occupation);
        }
      });
      return dailyExpensesMap;
    },
    []
  );

  useEffect(() => {
    if (!user_id) {
      setIsLoadingData(false);
      return;
    }
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      let fetchedSubTypes: string[] = [];
      let processedSales: Map<string, MetricBreakdown> = new Map();
      let processedExpenses: Map<string, ProcessedExpensesForDay> = new Map();
      let finalSubTypesList: string[] = [];

      try {
        const [userResponse, salesResponse, expensesResponse, loansResponse] =
          await Promise.all([
            axiosInstance.get(`/user/${user_id}`),
            axiosInstance.get<{ sales: SaleRecord[] }>(`/sales/user/${user_id}`),
            axiosInstance.get<{ expenses: ExpenseRecord[] }>(`/expenses/user/${user_id}`),
            axiosInstance.get(`/loans/user/${user_id}`),
          ]);

        const userData = userResponse.data.user ?? userResponse.data.data?.user;
        if (userData && userData.sub_type) {
          const rawSubTypes = userData.sub_type;
          fetchedSubTypes = Array.isArray(rawSubTypes)
            ? rawSubTypes
            : typeof rawSubTypes === "string"
            ? rawSubTypes.replace(/[{}"]/g, "").split(",").filter(Boolean)
            : [];
          setOpeningBalance(Number(userData.opening_balance) || 0);
        }
        finalSubTypesList = [...fetchedSubTypes];

        const salesRecords = salesResponse.data.sales || [];
        setLoans(loansResponse.data || []);
        processedSales = processSalesData(salesRecords, fetchedSubTypes);

        salesRecords.forEach((s) => {
          const occ = s.occupation || "Uncategorized";
          if (!finalSubTypesList.includes(occ)) finalSubTypesList.push(occ);
        });

        const expenseRecords = expensesResponse.data.expenses || [];
        processedExpenses = processExpensesData(expenseRecords, fetchedSubTypes);

        expenseRecords.forEach((e) => {
          const occ = e.occupation || "Uncategorized";
          if (!finalSubTypesList.includes(occ)) finalSubTypesList.push(occ);
        });

        setSubTypes(Array.from(new Set(finalSubTypesList)));

        const generatedData = generateDailyFinancialData(
          TOTAL_DAYS_FOR_HISTORICAL_DATA,
          finalSubTypesList.length > 0 ? finalSubTypesList : ["Uncategorized"],
          processedSales,
          processedExpenses
        );
        setFullHistoricalData(generatedData);
      } catch (error) {
        console.error("Mobile FinanceDashboard: Error fetching data:", error);
        Alert.alert("Error", "Could not load financial data.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, [user_id, processSalesData, processExpensesData]);

  const currentMonthCardData = useMemo(() => {
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
        title: "Revenue",
        value: totals.revenue,
        icon: "cash-multiple",
        bgColor: isDark ? "#14532d" : "#dcfce7",
        iconValueColor: isDark ? "#86efac" : "#16a34a",
        route: `/${user_id}/finance_sales`,
      },
      {
        title: "COGS",
        value: totals.cogs,
        icon: "cart-plus",
        bgColor: isDark ? "#713f12" : "#fef3c7",
        iconValueColor: isDark ? "#fcd34d" : "#b45309",
        route: `/${user_id}/finance_expenses`,
      },
      {
        title: "Gross Profit",
        value: grossProfit,
        icon: "chart-pie",
        bgColor: isDark ? "#164e63" : "#cffafe",
        iconValueColor: isDark ? "#67e8f9" : "#0891b2",
      },
      {
        title: "Expenses",
        value: totals.expenses,
        icon: "credit-card",
        bgColor: isDark ? "#7f1d1d" : "#fee2e2",
        iconValueColor: isDark ? "#fca5a5" : "#b91c1c",
        route: `/${user_id}/finance_expenses`,
      },
      {
        title: "Net Profit",
        value: netProfit,
        icon: "piggy-bank",
        bgColor: isDark ? "#1e3a8a" : "#dbeafe",
        iconValueColor: isDark ? "#93c5fd" : "#2563eb",
      },
    ];
  }, [fullHistoricalData, theme.dark, user_id]);

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return (
      <View style={styles.widgetContainer}>
        <View style={styles.cardGrid}>
          {currentMonthCardData.map((card, index) => (
            <View key={index} style={styles.cardWrapper}>
              <BudgetCard
                {...card}
                date={today}
                onPress={() => card.route && router.push(card.route as any)}
              />
            </View>
          ))}
        </View>
        <TrendGraph
          initialFullHistoricalData={fullHistoricalData}
          initialSubTypes={subTypes}
          isLoadingData={isLoadingData}
        />
        <CompareGraph
          initialFullHistoricalData={fullHistoricalData}
          isLoadingData={isLoadingData}
        />
        <WorkingCapital
          initialFullHistoricalData={fullHistoricalData}
          isLoadingData={isLoadingData}
          openingBalance={openingBalance}
        />
        <DebtAnalysis
          initialFullHistoricalData={fullHistoricalData}
          loans={loans}
          isLoadingData={isLoadingData}
        />
      </View>
    );
  };

  return (
    <PlatformLayout>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Appbar.Header elevated>
          <Appbar.Action
            icon={() => (
              <Icon
                type={"arrow-left" as any}
                size={22}
                color={theme.colors.onSurface}
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Finance Dashboard" />
          {openingBalance === 0 && (
            <Appbar.Action 
              icon="plus-circle-outline" 
              onPress={() => router.push(`/${user_id}/settings/finance_settings`)} 
            />
          )}
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.container}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { padding: 16 },
  widgetContainer: { gap: 32 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", margin: -8 },
  cardWrapper: { width: "50%", padding: 8 },
});

export default FinanceDashboardScreen;

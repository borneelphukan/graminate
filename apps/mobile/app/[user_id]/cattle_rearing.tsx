import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import BottomDrawer from "@/components/form/BottomDrawer";
import {
  CATTLE_FIELDS,
  CattleFormData,
} from "@/constants/formConfigs";
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

type CattleApiData = {
  cattle_id: number;
  cattle_name: string;
  cattle_type: string | null;
  number_of_animals: number;
  purpose: string | null;
  created_at: string;
};

const TOTAL_DAYS_FOR_HISTORICAL_DATA = 180;
const today = new Date();
today.setHours(0, 0, 0, 0);

const TARGET_CATTLE_SUB_TYPE = "Cattle Rearing";

const generateDailyFinancialData = (
  count: number,
  baseSubTypes: string[]
): DailyFinancialEntry[] => {
  const data: DailyFinancialEntry[] = [];
  let loopDate = subDaysDateFns(today, count - 1);
  const finalOccupationsList = baseSubTypes;

  for (let i = 0; i < count; i++) {
    const dailyEntry: DailyFinancialEntry = {
      date: new Date(loopDate),
      revenue: { total: 0, breakdown: finalOccupationsList.map(name => ({ name, value: 0 })) },
      cogs: { total: 0, breakdown: finalOccupationsList.map(name => ({ name, value: 0 })) },
      grossProfit: { total: 0, breakdown: finalOccupationsList.map(name => ({ name, value: 0 })) },
      expenses: { total: 0, breakdown: finalOccupationsList.map(name => ({ name, value: 0 })) },
      netProfit: { total: 0, breakdown: finalOccupationsList.map(name => ({ name, value: 0 })) },
    };
    data.push(dailyEntry);
    loopDate = addDaysDateFns(loopDate, 1);
  }
  return data;
};

const CattleRearingScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const theme = useTheme();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const navbarBg = "#1f2937"; // gray-800
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#374151"; // gray-700

  const [cattleRecords, setCattleRecords] = useState<CattleApiData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<DailyFinancialEntry[]>([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [editingCattle, setEditingCattle] = useState<CattleApiData | null>(null);

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

  const fetchFinancialData = useCallback(async () => {
    if (!user_id) {
      setIsLoadingFinancials(false);
      return;
    }
    setIsLoadingFinancials(true);
    try {
      const [salesRes, expensesRes] = await Promise.all([
        axiosInstance.get(`/sales/user/${user_id}`),
        axiosInstance.get(`/expenses/user/${user_id}`),
      ]);
      const cattleSales = (salesRes.data.sales || []).filter(
        (s: any) => s.occupation === TARGET_CATTLE_SUB_TYPE
      );
      const cattleExpensesList = (expensesRes.data.expenses || []).filter(
        (e: any) => e.occupation === TARGET_CATTLE_SUB_TYPE
      );

      // Simple monthly aggregation just for the BudgetCards
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      let revenueTotal = 0;
      cattleSales.forEach((s: any) => {
        const saleDate = new Date(s.sales_date);
        if (isWithinInterval(saleDate, { start: currentMonthStart, end: currentMonthEnd })) {
          const itemsCount = s.quantities_sold?.length || 0;
          for (let i = 0; i < itemsCount; i++) {
            revenueTotal += (s.quantities_sold[i] || 0) * (s.prices_per_unit?.[i] || 0);
          }
        }
      });

      let expensesTotal = 0;
      let cogsTotal = 0;
      cattleExpensesList.forEach((e: any) => {
        const expenseDate = new Date(e.date_created);
        if (isWithinInterval(expenseDate, { start: currentMonthStart, end: currentMonthEnd })) {
          if (e.category === "Agricultural Feeds" || e.category === "Livestock") {
            cogsTotal += e.expense || 0;
          } else {
            expensesTotal += e.expense || 0;
          }
        }
      });

      // For BudgetCards display
      setFullHistoricalData([{
        date: today,
        revenue: { total: revenueTotal, breakdown: [] },
        cogs: { total: cogsTotal, breakdown: [] },
        grossProfit: { total: revenueTotal - cogsTotal, breakdown: [] },
        expenses: { total: expensesTotal, breakdown: [] },
        netProfit: { total: revenueTotal - cogsTotal - expensesTotal, breakdown: [] },
      } as any]);

    } catch (error) {
      setFullHistoricalData([]);
    } finally {
      setIsLoadingFinancials(false);
    }
  }, [user_id]);

  const fetchCattle = useCallback(async () => {
    if (!user_id) {
      setLoadingCattle(false);
      return;
    }
    setLoadingCattle(true);
    try {
      const response = await axiosInstance.get(`/cattle-rearing/user/${user_id}`);
      setCattleRecords(response.data.cattleRearings || []);
    } catch (error) {
      setCattleRecords([]);
    } finally {
      setLoadingCattle(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchCattle();
      fetchFinancialData();
    }, [fetchCattle, fetchFinancialData])
  );

  const handleAddOrUpdateCattle = async (formData: CattleFormData) => {
    if (!numericUserId) return;
    try {
      const payload = {
        ...formData,
        user_id: numericUserId,
        number_of_animals: Number(formData.number_of_animals),
      };
      if (editingCattle) {
        await axiosInstance.put(`/cattle-rearing/update/${editingCattle.cattle_id}`, payload);
      } else {
        await axiosInstance.post("/cattle-rearing/add", payload);
      }
      await fetchCattle();
    } catch (error) {
      throw error;
    }
  };

  const cattleFinancialCardData = useMemo(() => {
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    let totals = { revenue: 0, cogs: 0, expenses: 0 };
    
    fullHistoricalData.forEach((entry) => {
      if (isWithinInterval(entry.date, { start: currentMonthStart, end: currentMonthEnd })) {
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
        title: "Cattle Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        bgColor: isDark ? "#14532d" : "#dcfce7",
        iconValueColor: isDark ? "#86efac" : "#16a34a",
      },
      {
        title: "Cattle COGS",
        value: totals.cogs,
        icon: "shopping-outline",
        bgColor: isDark ? "#713f12" : "#fef3c7",
        iconValueColor: isDark ? "#fcd34d" : "#b45309",
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
        icon: "credit-card-outline",
        bgColor: isDark ? "#7f1d1d" : "#fee2e2",
        iconValueColor: isDark ? "#fca5a5" : "#b91c1c",
      },
      {
        title: "Net Profit",
        value: netProfit,
        icon: "bank-outline",
        bgColor: isDark ? "#1e3a8a" : "#dbeafe",
        iconValueColor: isDark ? "#93c5fd" : "#2563eb",
      },
    ];
  }, [fullHistoricalData, theme.dark]);

  const filteredCattleRecords = useMemo(() => {
    if (!searchQuery) return cattleRecords;
    return cattleRecords.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [cattleRecords, searchQuery]);

  return (
    <PlatformLayout>
      <Appbar.Header
        style={{
          backgroundColor: navbarBg,
          borderBottomWidth: 1,
          borderBottomColor: navbarBorder,
        }}
      >
        <Appbar.Action icon={memoizedBackIcon} onPress={() => router.back()} />
        <Appbar.Content
          title="Cattle Rearing"
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitle={loadingCattle ? "Loading..." : `${filteredCattleRecords.length} Herd(s)`}
          subtitleStyle={{ color: navbarIconColor }}
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => {
            setEditingCattle(null);
            setIsFormVisible(true);
          }}
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

        {showFinancials && (
          isLoadingFinancials ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <View style={styles.cardGrid}>
              {cattleFinancialCardData.map((card, index) => (
                <View
                  key={index}
                  style={
                    index === cattleFinancialCardData.length - 1
                      ? styles.fullWidthCard
                      : styles.halfWidthCard
                  }
                >
                  <BudgetCard {...card} date={today} />
                </View>
              ))}
            </View>
          )
        )}

        <Searchbar
          placeholder="Search Herds..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        <View style={styles.listContainer}>
          {loadingCattle ? (
            <ActivityIndicator style={styles.loader} />
          ) : filteredCattleRecords.length > 0 ? (
            filteredCattleRecords.map((item) => (
              <Card
                key={item.cattle_id}
                onPress={() => {
                  setEditingCattle(item);
                  setIsFormVisible(true);
                }}
                style={styles.cattleCard}
              >
                <Card.Title title={item.cattle_name} titleVariant="titleLarge" />
                <Card.Content>
                  <View style={styles.cardDetails}>
                    <Text variant="bodyMedium">Type: {item.cattle_type || "N/A"}</Text>
                    <Text variant="bodyMedium">Count: {item.number_of_animals}</Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Purpose: {item.purpose || "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No records found. Tap '+' to add your first herd.</Text>
          )}
        </View>

        <View style={styles.projectSection}>
          <View style={styles.projectHeader}>
            <Text variant="headlineSmall" style={styles.projectTitle}>
              Your Cattle Rearing Tasks
            </Text>
            <Text variant="bodyMedium" style={styles.projectSubtitle}>
              All your cattle rearing tasks visualized
            </Text>
          </View>
          <View style={styles.projectBoardContainer}>
            {numericUserId > 0 && (
              <ProjectTaskBoard userId={numericUserId} projectTitle="Cattle Rearing" />
            )}
          </View>
        </View>

        <View style={styles.widgetContainer}>
          {user_id && (
            <WarehouseWidget userId={user_id} serviceName="Cattle Rearing" />
          )}
        </View>
      </ScrollView>

      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        title={editingCattle ? "Edit Herd" : "Add New Herd"}
        fields={CATTLE_FIELDS}
        initialValues={
          editingCattle
            ? {
                cattle_name: editingCattle.cattle_name || "",
                cattle_type: editingCattle.cattle_type || "",
                number_of_animals: String(editingCattle.number_of_animals || ""),
                purpose: editingCattle.purpose || "",
              }
            : {}
        }
        onSubmit={handleAddOrUpdateCattle}
        submitButtonText={editingCattle ? "Update Herd" : "Add Herd"}
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
  cattleCard: { marginBottom: 12 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emptyText: { textAlign: "center", marginTop: 40, padding: 16 },
  widgetContainer: { gap: 16, marginTop: 16, paddingBottom: 32 },
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

export default CattleRearingScreen;

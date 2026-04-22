import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import InventoryStockCard from "@/components/cards/InventoryStockCard";
import TaskManager from "@/components/cards/TaskManager";
import { APICULTURE_FIELDS, ApicultureFormData } from "@/constants/formConfigs";
import BottomDrawer from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import {
  endOfMonth,
  isWithinInterval,
  startOfMonth,
} from "date-fns";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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

export type ExistingApiaryData = {
  apiary_id?: number;
  user_id: number;
  apiary_name: string;
  number_of_hives: number;
  created_at?: string;
  area?: number | null;
  bee_species?: string;
  hive_type?: string;
  queen_source?: string;
  notes?: string;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const TARGET_APICULTURE_SUB_TYPE = "Apiculture";

const ApicultureScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const theme = useTheme();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const navbarBg = "#1f2937"; // gray-800
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#374151"; // gray-700

  const [apicultureRecords, setApicultureRecords] = useState<ExistingApiaryData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingApiculture, setLoadingApiculture] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<DailyFinancialEntry[]>([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [editingApiary, setEditingApiary] = useState<ExistingApiaryData | null>(null);

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
      const apicultureSales = (salesRes.data.sales || []).filter(
        (s: any) => s.occupation === TARGET_APICULTURE_SUB_TYPE
      );
      const apicultureExpensesList = (expensesRes.data.expenses || []).filter(
        (e: any) => e.occupation === TARGET_APICULTURE_SUB_TYPE
      );

      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      let revenueTotal = 0;
      apicultureSales.forEach((s: any) => {
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
      apicultureExpensesList.forEach((e: any) => {
        const expenseDate = new Date(e.date_created);
        if (isWithinInterval(expenseDate, { start: currentMonthStart, end: currentMonthEnd })) {
          const cogsCategories = ["Beehives", "Queen Bees", "Sugar Feed"];
          if (cogsCategories.includes(e.category)) {
            cogsTotal += e.expense || 0;
          } else {
            expensesTotal += e.expense || 0;
          }
        }
      });

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

  const fetchApiculture = useCallback(async () => {
    if (!user_id) {
      setLoadingApiculture(false);
      return;
    }
    setLoadingApiculture(true);
    try {
      const response = await axiosInstance.get(`/apiculture/user/${user_id}`);
      setApicultureRecords(response.data.apiaries || []);
    } catch (error) {
      setApicultureRecords([]);
    } finally {
      setLoadingApiculture(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchApiculture();
      fetchFinancialData();
    }, [fetchApiculture, fetchFinancialData])
  );

  const handleAddOrUpdateApiary = async (formData: ApicultureFormData) => {
    if (!numericUserId) return;
    try {
      const payload = {
        ...formData,
        user_id: numericUserId,
        number_of_hives: Number(formData.number_of_hives),
        area: formData.area ? Number(formData.area) : null,
      };
      if (editingApiary && editingApiary.apiary_id) {
        await axiosInstance.put(`/apiculture/update/${editingApiary.apiary_id}`, payload);
      } else {
        await axiosInstance.post("/apiculture/add", payload);
      }
      await fetchApiculture();
    } catch (error) {
      throw error;
    }
  };

  const apicultureFinancialCardData = useMemo(() => {
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
        title: "Apiary Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        bgColor: isDark ? "#14532d" : "#dcfce7",
        iconValueColor: isDark ? "#86efac" : "#16a34a",
      },
      {
        title: "Apiary COGS",
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

  const filteredApicultureRecords = useMemo(() => {
    if (!searchQuery) return apicultureRecords;
    return apicultureRecords.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [apicultureRecords, searchQuery]);

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
          title="Apiculture"
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitle={loadingApiculture ? "Loading..." : `${filteredApicultureRecords.length} Bee Yard(s)`}
          subtitleStyle={{ color: navbarIconColor }}
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => {
            setEditingApiary(null);
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
              {apicultureFinancialCardData.map((card, index) => (
                <View
                  key={index}
                  style={
                    index === apicultureFinancialCardData.length - 1
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
          placeholder="Search Bee Yards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        <View style={styles.listContainer}>
          {loadingApiculture ? (
            <ActivityIndicator style={styles.loader} />
          ) : filteredApicultureRecords.length > 0 ? (
            filteredApicultureRecords.map((item) => (
              <Card
                key={item.apiary_id}
                onPress={() => {
                  setEditingApiary(item);
                  setIsFormVisible(true);
                }}
                style={styles.apiaryCard}
              >
                <Card.Title title={item.apiary_name} titleVariant="titleLarge" />
                <Card.Content>
                  <View style={styles.cardDetails}>
                    <Text variant="bodyMedium">Hives: {item.number_of_hives}</Text>
                    <Text variant="bodyMedium">Area: {item.area != null ? `${item.area}m²` : "N/A"}</Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Species: {item.bee_species || "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No bee yards found. Tap '+' to add your first yard.</Text>
          )}
        </View>

        <View style={styles.widgetContainer}>
          {numericUserId > 0 && (
            <TaskManager userId={numericUserId} projectType="Apiculture" />
          )}
          {user_id && (
            <InventoryStockCard
              userId={user_id}
              title="Apiculture Inventory"
              category="Apiculture"
            />
          )}
        </View>
      </ScrollView>

      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingApiary(null);
        }}
        title={editingApiary ? "Edit Bee Yard" : "Add New Bee Yard"}
        fields={APICULTURE_FIELDS}
        initialValues={editingApiary ? {
          apiary_name: editingApiary.apiary_name || "",
          number_of_hives: String(editingApiary.number_of_hives || ""),
          bee_species: editingApiary.bee_species || "",
          hive_type: editingApiary.hive_type || "",
          queen_source: editingApiary.queen_source || "",
          area: editingApiary.area != null ? String(editingApiary.area) : "",
          notes: editingApiary.notes || "",
        } : undefined}
        onSubmit={handleAddOrUpdateApiary}
        submitButtonText={editingApiary ? "Update Bee Yard" : "Save Bee Yard"}
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
  apiaryCard: { marginBottom: 12 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  emptyText: { textAlign: "center", marginTop: 40, padding: 16 },
  widgetContainer: { gap: 16, paddingBottom: 32 },
});

export default ApicultureScreen;

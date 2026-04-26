import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import {
  FLORICULTURE_FIELDS,
  FloricultureFormData,
} from "@/constants/formConfigs";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import {
  endOfMonth,
  isWithinInterval,
  startOfMonth,
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

type FloricultureApiData = {
  flower_id: number;
  flower_name: string;
  flower_type: string | null;
  area: number | null;
  method: string | null;
  planting_date: string | null;
  created_at: string;
};

const TARGET_FLORICULTURE_SUB_TYPE = "Floriculture";

const FloricultureScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const theme = useTheme();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const navbarBg = "#1f2937"; // gray-800
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#374151"; // gray-700

  const [records, setRecords] = useState<FloricultureApiData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<DailyFinancialEntry[]>([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [editingRecord, setEditingRecord] = useState<FloricultureApiData | null>(null);

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
      const targetSales = (salesRes.data.sales || []).filter(
        (s: any) => s.occupation === TARGET_FLORICULTURE_SUB_TYPE
      );
      const targetExpensesList = (expensesRes.data.expenses || []).filter(
        (e: any) => e.occupation === TARGET_FLORICULTURE_SUB_TYPE
      );

      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      let revenueTotal = 0;
      targetSales.forEach((s: any) => {
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
      targetExpensesList.forEach((e: any) => {
        const expenseDate = new Date(e.date_created);
        if (isWithinInterval(expenseDate, { start: currentMonthStart, end: currentMonthEnd })) {
          // Floriculture COGS categories (aligned with web config)
          if (e.category === "Farm Utilities" || e.category === "Agricultural Feeds" || e.category === "Consulting") {
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

    } catch {
      setFullHistoricalData([]);
    } finally {
      setIsLoadingFinancials(false);
    }
  }, [user_id, today]);

  const fetchRecords = useCallback(async () => {
    if (!user_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/floriculture/user/${user_id}`);
      setRecords(response.data.floricultures || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
      fetchFinancialData();
    }, [fetchRecords, fetchFinancialData])
  );

  const handleAddOrUpdate = async (formData: FloricultureFormData) => {
    if (!numericUserId) return;
    try {
      const payload = {
        ...formData,
        user_id: numericUserId,
        area: formData.area ? Number(formData.area) : null,
      };
      if (editingRecord) {
        await axiosInstance.put(`/floriculture/update/${editingRecord.flower_id}`, payload);
      } else {
        await axiosInstance.post("/floriculture/add", payload);
      }
      await fetchRecords();
    } catch (error) {
      throw error;
    }
  };

  const financialCardData = useMemo(() => {
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
        title: "Flower Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        bgColor: isDark ? "#14532d" : "#dcfce7",
        iconValueColor: isDark ? "#86efac" : "#16a34a",
      },
      {
        title: "Flower COGS",
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
  }, [fullHistoricalData, today, theme.dark]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    return records.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [records, searchQuery]);

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
          title="Floriculture"
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitle={loading ? "Loading..." : `${filteredRecords.length} Crop(s)`}
          subtitleStyle={{ color: navbarIconColor }}
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => {
            setEditingRecord(null);
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
              {financialCardData.map((card, index) => (
                <View
                  key={index}
                  style={
                    index === financialCardData.length - 1
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
          placeholder="Search Crops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator style={styles.loader} />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((item) => (
              <Card
                key={item.flower_id}
                onPress={() => {
                  setEditingRecord(item);
                  setIsFormVisible(true);
                }}
                style={styles.cropCard}
              >
                <Card.Title title={item.flower_name} titleVariant="titleLarge" />
                <Card.Content>
                  <View style={styles.cardDetails}>
                    <Text variant="bodyMedium">Type: {item.flower_type || "N/A"}</Text>
                    <Text variant="bodyMedium">Area: {item.area || "N/A"} sq.ft</Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Method: {item.method || "N/A"} | Planted: {item.planting_date ? new Date(item.planting_date).toLocaleDateString() : "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No records found. Tap &apos;+&apos; to add your first crop.</Text>
          )}
        </View>

        <View style={styles.projectSection}>
          <View style={styles.projectHeader}>
            <Text variant="headlineSmall" style={styles.projectTitle}>
              Your Floriculture Tasks
            </Text>
            <Text variant="bodyMedium" style={styles.projectSubtitle}>
              All your floriculture tasks visualized
            </Text>
          </View>
          <View style={styles.projectBoardContainer}>
            {numericUserId > 0 && (
              <ProjectTaskBoard userId={numericUserId} projectTitle="Floriculture" />
            )}
          </View>
        </View>

        <View style={styles.widgetContainer}>
          {user_id && (
            <WarehouseWidget userId={user_id} serviceName="Floriculture" />
          )}
        </View>
      </ScrollView>

      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        title={editingRecord ? "Edit Crop" : "Add New Crop"}
        fields={FLORICULTURE_FIELDS}
        initialValues={
          editingRecord
            ? {
                flower_name: editingRecord.flower_name || "",
                flower_type: editingRecord.flower_type || "",
                method: editingRecord.method || "",
                area: String(editingRecord.area || ""),
                planting_date: editingRecord.planting_date ? editingRecord.planting_date.split('T')[0] : "",
              }
            : {}
        }
        onSubmit={handleAddOrUpdate}
        submitButtonText={editingRecord ? "Update Crop" : "Add Crop"}
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
  cropCard: { marginBottom: 12 },
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

export default FloricultureScreen;

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
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Searchbar,
  Text,
  useTheme,
} from "@/components/ui";

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
        type={"chevron-left" as any}
        size={22}
        color={theme.colors.onSurface}
      />
    ),
    [theme.colors.onSurface]
  );

  const memoizedAddIcon = useCallback(
    () => (
      <Icon
        type={"plus" as any}
        size={22}
        color={theme.colors.onSurface}
      />
    ),
    [theme.colors.onSurface]
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
      <Appbar.Header>
        <Appbar.Action icon={memoizedBackIcon} onPress={() => router.back()} />
        <Appbar.Content
          title="Floriculture"
          subtitle={loading ? "Loading..." : `${filteredRecords.length} Crop(s)`}
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
        <View className="items-end px-4 pt-2">
          <Button
            icon={() => (
              <Icon
                type={(showFinancials ? "chevron-up" : "chevron-down") as any}
                size={16}
                color={"text-light"}
              />
            )}
            onPress={() => setShowFinancials(!showFinancials)}
          >
            {showFinancials ? "Hide Finances" : "Show Finances"}
          </Button>
        </View>

        {showFinancials && (
          isLoadingFinancials ? (
            <ActivityIndicator className="my-4" />
          ) : (
            <View className="flex-row flex-wrap justify-between px-4 pb-4 gap-3">
              {financialCardData.map((card, index) => (
                <View
                  key={index}
                  className={
                    index === financialCardData.length - 1
                      ? "w-full"
                      : "w-[48%]"
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
          className="mx-4 mb-4"
        />

        <View className="px-4">
          {loading ? (
            <ActivityIndicator className="my-4" />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((item) => (
              <Card
                key={item.flower_id}
                onPress={() => {
                  setEditingRecord(item);
                  setIsFormVisible(true);
                }}
                className="mb-3"
              >
                <Card.Title title={item.flower_name} titleVariant="titleLarge" />
                <Card.Content>
                  <View className="flex-row justify-between mb-1">
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
            <Text className="text-center mt-10 p-4">No records found. Tap &apos;+&apos; to add your first crop.</Text>
          )}
        </View>

        <View className="mt-8 pt-8 border-t border-gray-500/20">
          <View className="px-4 mb-4">
            <Text variant="headlineSmall" className="font-bold">
              Your Floriculture Tasks
            </Text>
            <Text variant="bodyMedium" className="text-gray-500 mt-1">
              All your floriculture tasks visualized
            </Text>
          </View>
          <View className="bg-gray-500/5 rounded-3xl py-4 mx-4">
            {numericUserId > 0 && (
              <ProjectTaskBoard userId={numericUserId} projectTitle="Floriculture" />
            )}
          </View>
        </View>

        <View className="gap-4 mt-4 pb-8">
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

export default FloricultureScreen;

import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import { APICULTURE_FIELDS, ApicultureFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";
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
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const [apicultureRecords, setApicultureRecords] = useState<
    ExistingApiaryData[]
  >([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingApiculture, setLoadingApiculture] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<
    DailyFinancialEntry[]
  >([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [editingApiary, setEditingApiary] = useState<ExistingApiaryData | null>(
    null,
  );

  const memoizedBackIcon = useCallback(
    () => (
      <Icon
        type={"chevron-left" as any}
        size={22}
        className="text-dark dark:text-light"
      />
    ),
    [],
  );

  const memoizedAddIcon = useCallback(
    () => (
      <Icon
        type={"plus" as any}
        size={22}
        className="text-dark dark:text-light"
      />
    ),
    [],
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
        (s: any) => s.occupation === TARGET_APICULTURE_SUB_TYPE,
      );
      const apicultureExpensesList = (expensesRes.data.expenses || []).filter(
        (e: any) => e.occupation === TARGET_APICULTURE_SUB_TYPE,
      );

      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      let revenueTotal = 0;
      apicultureSales.forEach((s: any) => {
        const saleDate = new Date(s.sales_date);
        if (
          isWithinInterval(saleDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          const itemsCount = s.quantities_sold?.length || 0;
          for (let i = 0; i < itemsCount; i++) {
            revenueTotal +=
              (s.quantities_sold[i] || 0) * (s.prices_per_unit?.[i] || 0);
          }
        }
      });

      let expensesTotal = 0;
      let cogsTotal = 0;
      apicultureExpensesList.forEach((e: any) => {
        const expenseDate = new Date(e.date_created);
        if (
          isWithinInterval(expenseDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          const cogsCategories = ["Beehives", "Queen Bees", "Sugar Feed"];
          if (cogsCategories.includes(e.category)) {
            cogsTotal += e.expense || 0;
          } else {
            expensesTotal += e.expense || 0;
          }
        }
      });

      setFullHistoricalData([
        {
          date: today,
          revenue: { total: revenueTotal, breakdown: [] },
          cogs: { total: cogsTotal, breakdown: [] },
          grossProfit: { total: revenueTotal - cogsTotal, breakdown: [] },
          expenses: { total: expensesTotal, breakdown: [] },
          netProfit: {
            total: revenueTotal - cogsTotal - expensesTotal,
            breakdown: [],
          },
        } as any,
      ]);
    } catch {
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
    } catch {
      setApicultureRecords([]);
    } finally {
      setLoadingApiculture(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchApiculture();
      fetchFinancialData();
    }, [fetchApiculture, fetchFinancialData]),
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
        await axiosInstance.put(
          `/apiculture/update/${editingApiary.apiary_id}`,
          payload,
        );
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

    return [
      {
        title: "Apiary Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        className: "bg-green-100/10 dark:bg-green-900/20",
        textColorClassName: "text-green-600 dark:text-green-400",
      },
      {
        title: "Apiary COGS",
        value: totals.cogs,
        icon: "shopping-outline",
        className: "bg-yellow-100/10 dark:bg-yellow-900/20",
        textColorClassName: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "Gross Profit",
        value: grossProfit,
        icon: "chart-pie",
        className: "bg-cyan-100/10 dark:bg-cyan-900/20",
        textColorClassName: "text-cyan-600 dark:text-cyan-400",
      },
      {
        title: "Expenses",
        value: totals.expenses,
        icon: "credit-card-outline",
        className: "bg-red-100/10 dark:bg-red-900/20",
        textColorClassName: "text-red-600 dark:text-red-400",
      },
      {
        title: "Net Profit",
        value: netProfit,
        icon: "bank-outline",
        className: "bg-blue-100/10 dark:bg-blue-900/20",
        textColorClassName: "text-blue-600 dark:text-blue-400",
      },
    ];
  }, [fullHistoricalData]);

  const filteredApicultureRecords = useMemo(() => {
    if (!searchQuery) return apicultureRecords;
    return apicultureRecords.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [apicultureRecords, searchQuery]);

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action icon={memoizedBackIcon} onPress={() => router.back()} />
        <Appbar.Content
          title="Apiculture"
          subtitle={
            loadingApiculture
              ? "Loading..."
              : `${filteredApicultureRecords.length} Bee Yard(s)`
          }
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => {
            setEditingApiary(null);
            setIsFormVisible(true);
          }}
        />
      </Appbar.Header>

      <ScrollView className="bg-white dark:bg-dark">
        <View className="items-end px-4 pt-2">
          <Button
            mode="text"
            icon={() => (
              <Icon
                type={(showFinancials ? "chevron-up" : "chevron-down") as any}
                size={16}
                className="text-green-100 dark:text-green-200"
              />
            )}
            onPress={() => setShowFinancials(!showFinancials)}
          >
            {showFinancials ? "Hide Finances" : "Show Finances"}
          </Button>
        </View>

        {showFinancials &&
          (isLoadingFinancials ? (
            <ActivityIndicator className="my-4" />
          ) : (
            <View className="flex-row flex-wrap justify-between px-4 pb-4 gap-3">
              {apicultureFinancialCardData.map((card, index) => (
                <View
                  key={index}
                  className={
                    index === apicultureFinancialCardData.length - 1
                      ? "w-full"
                      : "w-[48%]"
                  }
                >
                  <BudgetCard {...card} date={today} />
                </View>
              ))}
            </View>
          ))}

        <Searchbar
          placeholder="Search Bee Yards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mx-4 mb-4"
        />

        <View className="px-4">
          {loadingApiculture ? (
            <ActivityIndicator className="my-4" />
          ) : filteredApicultureRecords.length > 0 ? (
            filteredApicultureRecords.map((item) => (
              <Card
                key={item.apiary_id}
                onPress={() => {
                  setEditingApiary(item);
                  setIsFormVisible(true);
                }}
                className="mb-3"
              >
                <Card.Title
                  title={item.apiary_name}
                  titleVariant="titleLarge"
                />
                <Card.Content>
                  <View className="flex-row justify-between mb-1">
                    <Text>Hives: {item.number_of_hives}</Text>
                    <Text>
                      Area: {item.area != null ? `${item.area}m²` : "N/A"}
                    </Text>
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500">
                    Species: {item.bee_species || "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text className="text-center mt-10 p-4">
              No bee yards found. Tap &apos;+&apos; to add your first yard.
            </Text>
          )}
        </View>

        <View className="mt-8 pt-8 border-t border-[rgba(128,128,128,0.2)]">
          <View className="px-4 mb-4">
            <Text className="font-bold">Your Apiculture Tasks</Text>
            <Text className="text-gray-500 mt-1">
              All your apiculture tasks visualized
            </Text>
          </View>
          <View className="bg-gray-800 rounded-3xl py-4 mx-4">
            {numericUserId > 0 && (
              <ProjectTaskBoard
                userId={numericUserId}
                projectTitle="Apiculture"
              />
            )}
          </View>
        </View>

        <View className="px-4 gap-4 mt-4 pb-8">
          {user_id && (
            <WarehouseWidget userId={user_id} serviceName="Apiculture" />
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
        initialValues={
          editingApiary
            ? {
                apiary_name: editingApiary.apiary_name || "",
                number_of_hives: String(editingApiary.number_of_hives || ""),
                bee_species: editingApiary.bee_species || "",
                hive_type: editingApiary.hive_type || "",
                queen_source: editingApiary.queen_source || "",
                area:
                  editingApiary.area != null ? String(editingApiary.area) : "",
                notes: editingApiary.notes || "",
              }
            : undefined
        }
        onSubmit={handleAddOrUpdateApiary}
        submitButtonText={editingApiary ? "Update Bee Yard" : "Save Bee Yard"}
      />
    </PlatformLayout>
  );
};

export default ApicultureScreen;

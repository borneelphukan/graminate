import { Icon } from "@/components/ui/Icon";
import BudgetCard from "@/components/cards/BudgetCard";
import ProjectTaskBoard from "@/components/tasks/ProjectTaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import { CATTLE_FIELDS, CattleFormData } from "@/constants/formConfigs";
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

type CattleApiData = {
  cattle_id: number;
  cattle_name: string;
  cattle_type: string | null;
  number_of_animals: number;
  purpose: string | null;
  created_at: string;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const TARGET_CATTLE_SUB_TYPE = "Cattle Rearing";

const CattleRearingScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const [cattleRecords, setCattleRecords] = useState<CattleApiData[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [fullHistoricalData, setFullHistoricalData] = useState<
    DailyFinancialEntry[]
  >([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showFinancials, setShowFinancials] = useState(true);
  const [editingCattle, setEditingCattle] = useState<CattleApiData | null>(
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
      const cattleSales = (salesRes.data.sales || []).filter(
        (s: any) => s.occupation === TARGET_CATTLE_SUB_TYPE,
      );
      const cattleExpensesList = (expensesRes.data.expenses || []).filter(
        (e: any) => e.occupation === TARGET_CATTLE_SUB_TYPE,
      );

      // Simple monthly aggregation just for the BudgetCards
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      let revenueTotal = 0;
      cattleSales.forEach((s: any) => {
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
      cattleExpensesList.forEach((e: any) => {
        const expenseDate = new Date(e.date_created);
        if (
          isWithinInterval(expenseDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          if (
            e.category === "Agricultural Feeds" ||
            e.category === "Livestock"
          ) {
            cogsTotal += e.expense || 0;
          } else {
            expensesTotal += e.expense || 0;
          }
        }
      });

      // For BudgetCards display
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

  const fetchCattle = useCallback(async () => {
    if (!user_id) {
      setLoadingCattle(false);
      return;
    }
    setLoadingCattle(true);
    try {
      const response = await axiosInstance.get(
        `/cattle-rearing/user/${user_id}`,
      );
      setCattleRecords(response.data.cattleRearings || []);
    } catch {
      setCattleRecords([]);
    } finally {
      setLoadingCattle(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchCattle();
      fetchFinancialData();
    }, [fetchCattle, fetchFinancialData]),
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
        await axiosInstance.put(
          `/cattle-rearing/update/${editingCattle.cattle_id}`,
          payload,
        );
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
        title: "Cattle Revenue",
        value: totals.revenue,
        icon: "currency-inr",
        className: "bg-green-300 dark:bg-green-100",
        textColorClassName: "text-dark dark:text-light",
      },
      {
        title: "Cattle COGS",
        value: totals.cogs,
        icon: "shopping-outline",
        className: "bg-yellow-300 dark:bg-yellow-100",
        textColorClassName: "text-dark dark:text-light",
      },
      {
        title: "Gross Profit",
        value: grossProfit,
        icon: "chart-pie",
        className: "bg-cyan-300 dark:bg-cyan-100",
        textColorClassName: "text-dark dark:text-light",
      },
      {
        title: "Expenses",
        value: totals.expenses,
        icon: "credit-card-outline",
        className: "bg-red-300 dark:bg-red-100",
        textColorClassName: "text-dark dark:text-light",
      },
      {
        title: "Net Profit",
        value: netProfit,
        icon: "bank-outline",
        className: "bg-blue-300 dark:bg-blue-100",
        textColorClassName: "text-blue-600 dark:text-blue-400",
      },
    ];
  }, [fullHistoricalData]);

  const filteredCattleRecords = useMemo(() => {
    if (!searchQuery) return cattleRecords;
    return cattleRecords.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
  }, [cattleRecords, searchQuery]);

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action icon={memoizedBackIcon} onPress={() => router.back()} />
        <Appbar.Content
          title="Cattle Rearing"
          subtitle={
            loadingCattle ? "Loading..." : `${cattleRecords.length} Cattle`
          }
        />
        <Appbar.Action
          icon={memoizedAddIcon}
          onPress={() => {
            setEditingCattle(null);
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
              {cattleFinancialCardData.map((card, index) => (
                <View
                  key={index}
                  className={
                    index === cattleFinancialCardData.length - 1
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
          placeholder="Search Herds..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mx-4 mb-4"
        />

        <View className="px-4">
          {loadingCattle ? (
            <ActivityIndicator className="my-4" />
          ) : filteredCattleRecords.length > 0 ? (
            filteredCattleRecords.map((item) => (
              <Card
                key={item.cattle_id}
                onPress={() => {
                  setEditingCattle(item);
                  setIsFormVisible(true);
                }}
                className="mb-3"
              >
                <Card.Title
                  title={item.cattle_name}
                  titleVariant="titleLarge"
                />
                <Card.Content>
                  <View className="flex-row justify-between mb-1">
                    <Text>
                      Type: {item.cattle_type || "N/A"}
                    </Text>
                    <Text>
                      Count: {item.number_of_animals}
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    className="text-gray-400 dark:text-gray-500"
                  >
                    Purpose: {item.purpose || "N/A"}
                  </Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text className="text-center mt-10 p-4">
              No records found. Tap &apos;+&apos; to add your first herd.
            </Text>
          )}
        </View>

        <View className="mt-8 pt-8 border-t border-[rgba(128,128,128,0.2)]">
          <View className="px-4 mb-4">
            <Text className="font-bold">
              Your Cattle Rearing Tasks
            </Text>
            <Text className="text-gray-500 mt-1">
              All your cattle rearing tasks visualized
            </Text>
          </View>
          <View className="bg-gray-800 rounded-3xl py-4 mx-4">
            {numericUserId > 0 && (
              <ProjectTaskBoard
                userId={numericUserId}
                projectTitle="Cattle Rearing"
              />
            )}
          </View>
        </View>

        <View className="px-4 gap-4 mt-4 pb-8">
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
                number_of_animals: String(
                  editingCattle.number_of_animals || "",
                ),
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
export default CattleRearingScreen;

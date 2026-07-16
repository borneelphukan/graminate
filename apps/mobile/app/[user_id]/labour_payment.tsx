import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Searchbar,
  Text,
} from "@/components/ui";

type Labour = {
  labour_id: string | number;
  full_name: string;
  base_salary: number;
  bonus: number | null;
  overtime_pay: number | null;
  housing_allowance: number | null;
  travel_allowance: number | null;
  meal_allowance: number | null;
  payment_frequency: string | null;
  role: string | null;
  aadhar_card_number: string;
  contact_number: string;
  created_at: string;
};

type PaymentRecord = {
  payment_id: number;
  labour_id: string | number;
  payment_date: string;
  salary_paid: number;
  bonus: number;
  overtime_pay: number;
  housing_allowance: number;
  travel_allowance: number;
  meal_allowance: number;
  total_amount: number;
  payment_status: "Pending" | "Paid" | "Failed" | string;
};

const LabourPaymentScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const [labourList, setLabourList] = useState<Labour[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const fetchData = useCallback(async () => {
    if (!user_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const labourResponse = await axiosInstance.get(`/labour/${encodeURIComponent(user_id)}`);
      const fetchedLabours: Labour[] = labourResponse.data.labours || [];
      setLabourList(fetchedLabours);

      const allPayments: PaymentRecord[] = [];
      await Promise.allSettled(
        fetchedLabours.map(async (labour: Labour) => {
          try {
            const paymentResponse = await axiosInstance.get(`/labour_payment/${labour.labour_id}`);
            const payments = paymentResponse.data.payments || paymentResponse.data.data?.payments || [];
            if (Array.isArray(payments)) {
              allPayments.push(...payments);
            }
          } catch (error) {
            console.error(`Error fetching payments for labour ${labour.labour_id}:`, error);
          }
        })
      );
      setPaymentRecords(allPayments);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLabourList([]);
      setPaymentRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const currentMonthLabours = useMemo(() => {
    return labourList.filter((labour) => {
      const date = new Date(labour.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [labourList, currentMonth, currentYear]);

  const basicSalaryToPay = useMemo(() => {
    return currentMonthLabours.reduce((sum, labour) => sum + Number(labour.base_salary || 0), 0);
  }, [currentMonthLabours]);

  const combinedSalaryToPay = useMemo(() => {
    return currentMonthLabours.reduce((sum, labour) => {
      const combined =
        Number(labour.base_salary || 0) +
        Number(labour.bonus || 0) +
        Number(labour.overtime_pay || 0) +
        Number(labour.housing_allowance || 0) +
        Number(labour.travel_allowance || 0) +
        Number(labour.meal_allowance || 0);
      return sum + combined;
    }, 0);
  }, [currentMonthLabours]);

  const totalPaid = useMemo(() => {
    return paymentRecords
      .filter((p) => (p.payment_status || "").toLowerCase() === "paid")
      .reduce((sum, p) => {
        const amount = typeof p.total_amount === "string" ? parseFloat(p.total_amount) : typeof p.total_amount === "number" ? p.total_amount : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  }, [paymentRecords]);

  const remainingCombinedToPay = useMemo(() => {
    return Math.max(0, combinedSalaryToPay - totalPaid);
  }, [combinedSalaryToPay, totalPaid]);

  const filteredLabour = useMemo(() => {
    if (!searchQuery) return labourList;
    return labourList.filter((labour) =>
      [labour.full_name, labour.role, labour.contact_number, labour.aadhar_card_number]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [labourList, searchQuery]);

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon type={"chevron-left" as any} size={22} className="text-dark dark:text-light" />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Salary Manager" />
      </Appbar.Header>

      <ScrollView className="bg-white dark:bg-dark flex-1" contentContainerClassName="pb-20">
        {/* Summary Cards */}
        <View className="px-4 pt-4 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <Text className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                Basic Salary Confirmed
              </Text>
              <Text className="text-lg font-bold text-green-800 dark:text-green-200">
                {formatCurrency(basicSalaryToPay)}
              </Text>
            </View>
            <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Overall Salary Due
              </Text>
              <Text className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(combinedSalaryToPay)}
              </Text>
              <Text className="text-[10px] text-blue-600/60 dark:text-blue-300/60">
                (Base + Allowances + Bonus)
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
              <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Salary Paid
              </Text>
              <Text className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                {formatCurrency(totalPaid)}
              </Text>
              <Text className="text-[10px] text-emerald-600/60 dark:text-emerald-300/60">
                (Based on Paid records)
              </Text>
            </View>
            <View className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
              <Text className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
                Salary Due
              </Text>
              <Text className="text-lg font-bold text-red-800 dark:text-red-200">
                {formatCurrency(remainingCombinedToPay)}
              </Text>
            </View>
          </View>
        </View>

        {/* Employee List */}
        <View className="px-4 mt-6">
          <Text className="font-bold text-lg text-dark dark:text-light mb-3">
            Employee List
          </Text>

          <Searchbar
            placeholder="Search employees..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mb-4"
          />

          {loading ? (
            <ActivityIndicator className="my-8" />
          ) : filteredLabour.length > 0 ? (
            filteredLabour.map((labour) => (
              <Card
                key={labour.labour_id}
                onPress={() => {
                  router.push(`/${user_id}/labour_payment/${labour.labour_id}` as any);
                }}
                className="mb-3"
              >
                <Card.Content>
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="font-bold text-dark dark:text-light">
                        {labour.full_name}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {labour.role || "N/A"}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-dark dark:text-light">
                        {formatCurrency(labour.base_salary)}
                      </Text>
                      <Text className="text-[10px] text-gray-400">
                        /{labour.payment_frequency || "Monthly"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-4">
                    {labour.contact_number && (
                      <View className="flex-row items-center gap-1">
                        <Icon type={"phone" as any} size={10} className="text-gray-400" />
                        <Text className="text-[10px] text-gray-500">{labour.contact_number}</Text>
                      </View>
                    )}
                    {labour.aadhar_card_number && (
                      <View className="flex-row items-center gap-1">
                        <Icon type={"card-account-details" as any} size={10} className="text-gray-400" />
                        <Text className="text-[10px] text-gray-500">{labour.aadhar_card_number}</Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text className="text-center mt-10 p-4 text-gray-500">
              No employees found.
            </Text>
          )}
        </View>
      </ScrollView>
    </PlatformLayout>
  );
};

export default LabourPaymentScreen;

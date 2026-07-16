import { Icon } from "@/components/ui/Icon";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Text,
} from "@/components/ui";

type Labour = {
  labour_id: number;
  full_name: string;
  contact_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};

type PaymentRecord = {
  payment_id: number;
  labour_id: number;
  payment_date: string;
  salary_paid: number;
  bonus: number;
  overtime_pay: number;
  housing_allowance: number;
  travel_allowance: number;
  meal_allowance: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

const PAYMENT_STATUS = ["Pending", "Paid"];

const LabourPaymentDetailScreen = () => {
  const router = useRouter();
  const { user_id, id } = useLocalSearchParams<{ user_id: string; id: string }>();

  const [labourName, setLabourName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const PAYMENT_FIELDS = [
    { name: "paymentDate", label: "Payment Date *", type: "date" as const, required: true, icon: "calendar" as any },
    { name: "salaryPaid", label: "Salary Paid *", type: "number" as const, required: true, icon: "currency-inr" as any },
    { name: "bonus", label: "Bonus", type: "number" as const, icon: "gift" as any },
    { name: "overtimePay", label: "Overtime Pay", type: "number" as const, icon: "clock-fast" as any },
    { name: "housingAllowance", label: "Housing Allowance", type: "number" as const, icon: "home-city" as any },
    { name: "travelAllowance", label: "Travel Allowance", type: "number" as const, icon: "car" as any },
    { name: "mealAllowance", label: "Meal Allowance", type: "number" as const, icon: "food" as any },
    { name: "paymentStatus", label: "Payment Status", type: "dropdown" as const, items: PAYMENT_STATUS, icon: "check-circle" as any },
  ];

  const fetchData = useCallback(async () => {
    if (!user_id || !id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/labour/${encodeURIComponent(user_id)}`);
      const labours = response.data.labours || [];
      const labour = labours.find((l: Labour) => l.labour_id === Number(id));

      if (labour) {
        setLabourName(labour.full_name);
        setContact(labour.contact_number || "");
        setAddress(
          [labour.address_line_1, labour.address_line_2, labour.city, labour.state, labour.postal_code]
            .filter(Boolean)
            .join(", ")
        );
      }

      try {
        const paymentResponse = await axiosInstance.get(`/labour_payment/${id}`);
        const payments = paymentResponse.data.payments || paymentResponse.data.data?.payments || [];
        setPaymentRecords(payments);
      } catch {
        setPaymentRecords([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user_id, id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAddOrUpdatePayment = async (formData: any) => {
    if (!id) return;
    const parseOrDefault = (value: string) => parseFloat(value) || 0;
    const payload = {
      labour_id: Number(id),
      payment_date: formData.paymentDate,
      salary_paid: parseOrDefault(formData.salaryPaid),
      bonus: parseOrDefault(formData.bonus),
      overtime_pay: parseOrDefault(formData.overtimePay),
      housing_allowance: parseOrDefault(formData.housingAllowance),
      travel_allowance: parseOrDefault(formData.travelAllowance),
      meal_allowance: parseOrDefault(formData.mealAllowance),
      payment_status: formData.paymentStatus || "Pending",
    };

    try {
      if (editingPayment) {
        await axiosInstance.put("/labour_payment/update", {
          ...payload,
          payment_id: editingPayment.payment_id,
        });
        Alert.alert("Success", "Salary updated successfully!");
      } else {
        await axiosInstance.post("/labour_payment/add", payload);
        Alert.alert("Success", "Salary added successfully!");
      }
      await fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to save salary record.";
      Alert.alert("Error", errorMsg);
      throw error;
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    Alert.alert("Delete Payment", "Are you sure you want to delete this payment record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosInstance.delete(`/labour_payment/delete/${paymentId}`);
            await fetchData();
          } catch {
            Alert.alert("Error", "Failed to delete payment record.");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateString;
    }
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
        <Appbar.Content title="Salary Details" />
        <Button
          mode="contained"
          onPress={() => {
            setEditingPayment(null);
            setIsFormVisible(true);
          }}
          className="!px-3 !py-1.5 mr-2"
        >
          Add Salary
        </Button>
      </Appbar.Header>

      <ScrollView className="bg-white dark:bg-dark flex-1" contentContainerClassName="pb-20">
        {/* Employee Info */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Icon type={"account" as any} size={16} className="text-gray-400" />
            <Text className="font-semibold text-dark dark:text-light">{labourName}</Text>
          </View>
          {contact ? (
            <View className="flex-row items-center gap-2 mb-1">
              <Icon type={"phone" as any} size={14} className="text-gray-400" />
              <Text className="text-sm text-gray-500">{contact}</Text>
            </View>
          ) : null}
          {address ? (
            <View className="flex-row items-center gap-2">
              <Icon type={"home" as any} size={14} className="text-gray-400" />
              <Text className="text-sm text-gray-500">{address}</Text>
            </View>
          ) : null}
        </View>

        {/* Payment Records */}
        <View className="px-4 mt-4">
          <Text className="font-bold text-lg text-dark dark:text-light mb-3">
            Payment Records
          </Text>

          {loading ? (
            <ActivityIndicator className="my-8" />
          ) : paymentRecords.length > 0 ? (
            paymentRecords.map((record) => (
              <Card
                key={record.payment_id}
                onPress={() => {
                  setEditingPayment(record);
                  setIsFormVisible(true);
                }}
                className="mb-3"
              >
                <Card.Content>
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="font-bold text-dark dark:text-light">
                        {formatDate(record.payment_date)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Total: {formatCurrency(record.total_amount)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className={`px-2 py-0.5 rounded-full ${
                        record.payment_status === "Paid"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-yellow-100 dark:bg-yellow-900/30"
                      }`}>
                        <Text className={`text-xs font-bold ${
                          record.payment_status === "Paid"
                            ? "text-green-700 dark:text-green-300"
                            : "text-yellow-700 dark:text-yellow-300"
                        }`}>
                          {record.payment_status}
                        </Text>
                      </View>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleDeletePayment(record.payment_id)}
                        textColor="#e53e3e"
                      >
                        Delete
                      </Button>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                    <Text className="text-[10px] text-gray-400">
                      Base: {formatCurrency(record.salary_paid)}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      Bonus: {formatCurrency(record.bonus)}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      OT: {formatCurrency(record.overtime_pay)}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      Housing: {formatCurrency(record.housing_allowance)}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      Travel: {formatCurrency(record.travel_allowance)}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      Meal: {formatCurrency(record.meal_allowance)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text className="text-center mt-10 p-4 text-gray-500">
              No payment records yet. Tap &quot;Add Salary&quot; to add one.
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? "Update Salary" : "Add New Salary"}
        fields={PAYMENT_FIELDS}
        initialValues={
          editingPayment
            ? {
                paymentDate: editingPayment.payment_date ? editingPayment.payment_date.split("T")[0] : "",
                salaryPaid: editingPayment.salary_paid?.toString() || "",
                bonus: editingPayment.bonus?.toString() || "",
                overtimePay: editingPayment.overtime_pay?.toString() || "",
                housingAllowance: editingPayment.housing_allowance?.toString() || "",
                travelAllowance: editingPayment.travel_allowance?.toString() || "",
                mealAllowance: editingPayment.meal_allowance?.toString() || "",
                paymentStatus: editingPayment.payment_status || "Pending",
              }
            : { paymentStatus: "Pending" }
        }
        onSubmit={handleAddOrUpdatePayment}
        submitButtonText={editingPayment ? "Update Salary" : "Add Salary"}
      />
    </PlatformLayout>
  );
};

export default LabourPaymentDetailScreen;

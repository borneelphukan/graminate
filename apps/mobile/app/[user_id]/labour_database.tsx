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
  Searchbar,
  Text,
} from "@/components/ui";

type LabourRecord = {
  labour_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  role: string;
  contact_number: string;
  aadhar_card_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  created_at: string;
};

const GENDER = ["Male", "Female", "Other"];
const PAYMENT_FREQUENCY = ["Monthly", "Weekly", "Bi-weekly", "Daily"];

const LabourDatabaseScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const numericUserId = user_id ? parseInt(user_id, 10) : 0;

  const [labourRecords, setLabourRecords] = useState<LabourRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const LABOUR_FIELDS = [
    { name: "fullName", label: "Full Name", type: "text" as const, required: true, icon: "account" as any },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" as const, required: true, icon: "calendar" as any },
    { name: "role", label: "Designation / Role", type: "text" as const, required: true, icon: "briefcase" as any },
    { name: "gender", label: "Gender", type: "dropdown" as const, items: GENDER, required: true, icon: "account-group" as any },
    { name: "contactNumber", label: "Contact Number", type: "phone" as const, required: true, icon: "phone" as any },
    { name: "aadharCardNumber", label: "Aadhar Card Number", type: "text" as const, required: true, icon: "card-account-details" as any },
    { name: "addressLine1", label: "Address Line 1", type: "text" as const, required: true, icon: "home" as any },
    { name: "addressLine2", label: "Address Line 2 (Optional)", type: "text" as const, icon: "home-outline" as any },
    { name: "city", label: "City", type: "text" as const, required: true, icon: "city" as any },
    { name: "state", label: "State", type: "text" as const, required: true, icon: "map-marker" as any },
    { name: "postalCode", label: "Postal Code", type: "text" as const, required: true, icon: "map-marker-radius" as any },
    { name: "baseSalary", label: "Base Salary (₹)", type: "number" as const, icon: "currency-inr" as any },
    { name: "paymentFrequency", label: "Payment Frequency", type: "dropdown" as const, items: PAYMENT_FREQUENCY, icon: "clock-outline" as any },
    { name: "bonus", label: "Bonus (₹)", type: "number" as const, icon: "gift" as any },
    { name: "overtimePay", label: "Overtime (₹)", type: "number" as const, icon: "clock-fast" as any },
    { name: "housingAllowance", label: "Housing Allowance (₹)", type: "number" as const, icon: "home-city" as any },
    { name: "travelAllowance", label: "Travel Allowance (₹)", type: "number" as const, icon: "car" as any },
    { name: "mealAllowance", label: "Meal Allowance (₹)", type: "number" as const, icon: "food" as any },
  ];

  const fetchLabour = useCallback(async () => {
    if (!user_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/labour/${encodeURIComponent(user_id)}`);
      setLabourRecords(response.data.labours || []);
    } catch (error) {
      console.error("Error fetching labour data:", error);
      setLabourRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchLabour();
    }, [fetchLabour])
  );

  const handleAddEmployee = async (formData: any) => {
    if (!numericUserId) return;
    try {
      const payload = {
        user_id: numericUserId,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        role: formData.role,
        contact_number: formData.contactNumber,
        aadhar_card_number: formData.aadharCardNumber,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2 || "",
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        base_salary: formData.baseSalary ? parseFloat(formData.baseSalary) : 0,
        bonus: formData.bonus ? parseFloat(formData.bonus) : 0,
        overtime_pay: formData.overtimePay ? parseFloat(formData.overtimePay) : 0,
        housing_allowance: formData.housingAllowance ? parseFloat(formData.housingAllowance) : 0,
        travel_allowance: formData.travelAllowance ? parseFloat(formData.travelAllowance) : 0,
        meal_allowance: formData.mealAllowance ? parseFloat(formData.mealAllowance) : 0,
        payment_frequency: formData.paymentFrequency,
      };
      await axiosInstance.post("/labour/add", payload);
      Alert.alert("Success", "Employee added successfully!");
      await fetchLabour();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to add employee.";
      Alert.alert("Error", errorMsg);
      throw error;
    }
  };

  const handleDeleteEmployee = async (labourId: string) => {
    Alert.alert("Delete Employee", "Are you sure you want to delete this employee?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosInstance.delete(`/labour/delete/${labourId}`);
            await fetchLabour();
          } catch {
            Alert.alert("Error", "Failed to delete employee.");
          }
        },
      },
    ]);
  };

  const filteredRecords = searchQuery
    ? labourRecords.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : labourRecords;

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon type={"chevron-left" as any} size={22} className="text-dark dark:text-light" />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Employee Database"
          subtitle={loading ? "Loading..." : `${labourRecords.length} Record(s)`}
        />
        <Button
          mode="contained"
          onPress={() => setIsFormVisible(true)}
          className="!px-3 !py-1.5 mr-2"
        >
          Add Employee
        </Button>
      </Appbar.Header>

      <ScrollView className="bg-white dark:bg-dark flex-1">
        <Searchbar
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mx-4 mt-4 mb-4"
        />

        <View className="px-4">
          {loading ? (
            <ActivityIndicator className="my-8" />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((item) => (
              <Card
                key={item.labour_id}
                onPress={() => {
                  router.push({
                    pathname: `/${user_id}/labour_database/${item.labour_id}`,
                    params: { data: JSON.stringify(item) },
                  } as any);
                }}
                className="mb-3"
              >
                <Card.Content>
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="font-bold text-lg text-dark dark:text-light">
                        {item.full_name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {item.role}
                      </Text>
                    </View>
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleDeleteEmployee(item.labour_id)}
                      textColor="#e53e3e"
                    >
                      Delete
                    </Button>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {item.contact_number && (
                      <View className="flex-row items-center gap-1">
                        <Icon type={"phone" as any} size={12} className="text-gray-400" />
                        <Text className="text-xs text-gray-500">{item.contact_number}</Text>
                      </View>
                    )}
                    {item.city && (
                      <View className="flex-row items-center gap-1">
                        <Icon type={"map-marker" as any} size={12} className="text-gray-400" />
                        <Text className="text-xs text-gray-500">{item.city}, {item.state}</Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text className="text-center mt-10 p-4 text-gray-500">
              No employees found. Tap &quot;Add Employee&quot; to get started.
            </Text>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      <BottomDrawer
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        title="Add New Employee"
        fields={LABOUR_FIELDS}
        initialValues={{ paymentFrequency: "Monthly" }}
        onSubmit={handleAddEmployee}
        submitButtonText="Add Employee"
      />
    </PlatformLayout>
  );
};

export default LabourDatabaseScreen;

import { Icon } from "@/components/ui/Icon";
import { LOAN_FIELDS, LoanFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  FAB,
  Searchbar,
  Text,
} from "@/components/ui";

type LoanRecord = {
  loan_id: number;
  loan_name: string;
  lender: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  status: string;
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const LoanCard = ({ item }: { item: LoanRecord }) => {

  return (
    <Card className="mb-3 rounded-xl">
      <Card.Title
        title={item.loan_name}
        subtitle={item.lender}
        right={() => (
          <Text variant="titleMedium" className="text-green-100 dark:text-green-200 mr-4">
            {formatCurrency(item.amount)}
          </Text>
        )}
      />
      <Card.Content>
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center gap-1">
            <Icon type="percent" size={14} className="text-gray-400 dark:text-gray-500" />
            <Text className="text-[13px]">{item.interest_rate}% Interest</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon type="calendar" size={14} className="text-gray-400 dark:text-gray-500" />
            <Text className="text-[13px]">{formatDate(item.start_date)}</Text>
          </View>
          <Chip compact className="h-6">{item.status}</Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

const FinanceLoans = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const navigation = useNavigation();
  const [data, setData] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Loan Management" });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/loans/user/${user_id}`);
      setData(response.data || []);
    } catch {
      console.error("Error fetching loans:");
      Alert.alert("Error", "Failed to load loan records.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateLoan = async (formData: LoanFormData) => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`/loans/user/${user_id}`, formData);
      Alert.alert("Success", "Loan logged successfully.");
      setFormVisible(false);
      fetchData();
    } catch {
      console.error("Error creating loan:");
      Alert.alert("Error", "Failed to log loan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.loan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.lender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loan Management" />
        </Appbar.Header>

        <View className="flex-1 p-4">
          <Searchbar
            placeholder="Search loans..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="mb-4 bg-transparent rounded-xl"
          />

          {loading ? (
            <View className="flex-1 justify-center items-center p-5">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={({ item }) => <LoanCard item={item} />}
              keyExtractor={(item) => item.loan_id.toString()}
              contentContainerClassName="pb-20"
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-5">
                  <Text className="text-gray-400 dark:text-gray-600">
                    No loan records found.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <FAB
          icon="plus"
          label="Log Loan"
          className="absolute right-4 bottom-4 rounded-full bg-green-100"
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <BottomDrawer
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Log New Loan"
          onSubmit={handleCreateLoan}
          isSubmitting={submitting}
          submitButtonText="Save Loan"
          fields={LOAN_FIELDS}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default FinanceLoans;

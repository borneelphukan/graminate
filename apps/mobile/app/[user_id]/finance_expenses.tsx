import { Icon } from "@/components/ui/Icon";
import { EXPENSE_FIELDS, ExpenseFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from "@/components/ui";

type ExpenseRecord = {
  expense_id: number;
  title: string;
  category: string;
  expense: number;
  date_created: string;
  occupation?: string;
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

const ExpenseCard = ({ item }: { item: ExpenseRecord }) => {
  const theme = useTheme();

  return (
    <Card className="mb-3 rounded-xl">
      <Card.Title
        title={item.title}
        subtitle={item.occupation || "General"}
        right={() => (
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginRight: 16 }}>
            {formatCurrency(item.expense)}
          </Text>
        )}
      />
      <Card.Content>
        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center gap-1">
            <Icon type="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text className="text-[13px]">{formatDate(item.date_created)}</Text>
          </View>
          <Chip compact className="h-6">{item.category}</Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

const FinanceExpenses = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const navigation = useNavigation();
  const theme = useTheme();
  const [data, setData] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userSubTypes, setUserSubTypes] = useState<string[]>([]);

  const fetchUserSubTypes = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/user/${user_id}`);
      const user = response.data?.data?.user ?? response.data?.user;
      setUserSubTypes(Array.isArray(user?.sub_type) ? user.sub_type : []);
    } catch {
      console.error("Error fetching user sub_types:");
    }
  }, [user_id]);

  useEffect(() => {
    navigation.setOptions({ title: "Expense Ledger" });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/expenses/user/${user_id}`);
      setData(response.data.expenses || []);
    } catch {
      console.error("Error fetching expenses:");
      Alert.alert("Error", "Failed to load expense records.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
    fetchUserSubTypes();
  }, [fetchData, fetchUserSubTypes]);

  const expenseFields = useMemo(() => {
    return EXPENSE_FIELDS.map((f) => {
      if (f.name === "occupation") {
        return { ...f, items: userSubTypes };
      }
      return f;
    });
  }, [userSubTypes]);

  const handleCreateExpense = async (formData: ExpenseFormData) => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/expenses/add", {
        ...formData,
        user_id: Number(user_id),
      });
      Alert.alert("Success", "Expense logged successfully.");
      setFormVisible(false);
      fetchData();
    } catch {
      console.error("Error creating expense:");
      Alert.alert("Error", "Failed to log expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Expense Ledger" />
        </Appbar.Header>

        <View className="flex-1 p-4">
          <Searchbar
            placeholder="Search expenses..."
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
              renderItem={({ item }) => <ExpenseCard item={item} />}
              keyExtractor={(item) => item.expense_id.toString()}
              contentContainerClassName="pb-20"
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-5">
                  <Text style={{ color: theme.colors.onSurfaceDisabled }}>
                    No expense records found.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <FAB
          icon="plus"
          label="Log Expense"
          className="absolute right-4 bottom-4 rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <BottomDrawer
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Log New Expense"
          onSubmit={handleCreateExpense}
          isSubmitting={submitting}
          submitButtonText="Save Expense"
          fields={expenseFields}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default FinanceExpenses;

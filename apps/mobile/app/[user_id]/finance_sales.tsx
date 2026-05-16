import { Icon } from "@/components/ui/Icon";
import { SALES_FIELDS_WITH_ITEMS } from "@/constants/formConfigs";
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
  FAB,
  Searchbar,
  Text,
} from "@/components/ui";

type SaleRecord = {
  sales_id: number;
  sales_name?: string;
  sales_date: string;
  occupation?: string;
  items_sold: string[];
  quantities_sold: number[];
  prices_per_unit: number[];
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

const SaleCard = ({ item }: { item: SaleRecord }) => {
  const totalAmount = item.quantities_sold.reduce(
    (sum, q, i) => sum + q * (item.prices_per_unit[i] || 0),
    0
  );

  return (
    <Card className="mb-3 rounded-xl">
      <Card.Title
        title={item.sales_name || "Untitled Sale"}
        subtitle={item.occupation || "Uncategorized"}
        right={() => (
          <Text className="text-green-100 dark:text-green-200 mr-4">
            {formatCurrency(totalAmount)}
          </Text>
        )}
      />
      <Card.Content>
        <View className="flex-row justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <Icon type="calendar" size={16} className="text-gray-400 dark:text-gray-500" />
            <Text className="text-[13px]">{formatDate(item.sales_date)}</Text>
          </View>
          <Text className="text-gray-400 dark:text-gray-500">
            {item.items_sold.length} item{item.items_sold.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const FinanceSales = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const navigation = useNavigation();
  const [data, setData] = useState<SaleRecord[]>([]);
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
    navigation.setOptions({ title: "Sales Ledger" });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/sales/user/${user_id}`);
      setData(response.data.sales || []);
    } catch {
      console.error("Error fetching sales:");
      Alert.alert("Error", "Failed to load sales records.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
    fetchUserSubTypes();
  }, [fetchData, fetchUserSubTypes]);

  const salesFields = useMemo(() => {
    return SALES_FIELDS_WITH_ITEMS.map((f) => {
      if (f.name === "occupation") {
        return { ...f, items: userSubTypes };
      }
      return f;
    });
  }, [userSubTypes]);

  const handleCreateSale = async (formData: any) => {
    setSubmitting(true);
    try {
      // Transform BottomDrawer data to match backend schema
      const items = formData.items || [];
      const payload = {
        sales_name: formData.sales_name,
        sales_date: formData.sales_date,
        occupation: formData.occupation,
        items_sold: items.map((i: any) => i.name || ""),
        quantities_sold: items.map((i: any) => Number(i.quantity || 0)),
        prices_per_unit: items.map((i: any) => Number(i.price_per_unit || 0)),
        quantity_unit: items[0]?.unit || undefined,
        user_id: Number(user_id),
      };
      await axiosInstance.post("/sales/add", payload);
      Alert.alert("Success", "Sale logged successfully.");
      setFormVisible(false);
      fetchData();
    } catch {
      console.error("Error creating sale:");
      Alert.alert("Error", "Failed to log sale.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) =>
    (item.sales_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.occupation || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sales Ledger" />
        </Appbar.Header>

        <View className="flex-1 p-4">
          <Searchbar
            placeholder="Search sales..."
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
              renderItem={({ item }) => <SaleCard item={item} />}
              keyExtractor={(item) => item.sales_id.toString()}
              contentContainerClassName="pb-20"
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-5">
                  <Text className="text-gray-400 dark:text-gray-600">
                    No sales records found.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <FAB
          icon="plus"
          label="Log Sale"
          className="absolute right-4 bottom-4 rounded-full bg-green-100"
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <BottomDrawer
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Log New Sale"
          onSubmit={handleCreateSale}
          isSubmitting={submitting}
          submitButtonText="Save Sale"
          fields={salesFields}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default FinanceSales;

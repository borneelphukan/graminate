import { Icon } from "@/components/ui/Icon";
import { RECEIPT_FIELDS_WITH_ITEMS } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from "@/components/ui";

type Receipt = {
  invoice_id: number;
  title: string;
  bill_to: string;
  due_date: string;
  created_at: string;
  receipt_date: string;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const ReceiptCard = ({
  item,
  onPress,
}: {
  item: Receipt;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Card onPress={onPress} className="mb-3 rounded-xl">
      <Card.Title title={item.title} subtitle={`Billed to: ${item.bill_to}`} />
      <Card.Content>
        <View className="flex-row justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <Icon
              type={"calendar-month" as any}
              size={16}
              color={theme.colors.error}
            />
            <Text className="text-[13px]" style={{ color: theme.colors.error }}>
              Due: {formatDate(item.due_date)}
            </Text>
          </View>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Issued: {formatDate(item.receipt_date || item.created_at)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const FinanceReceipts = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [data, setData] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allSales, setAllSales] = useState<any[]>([]);

  const fetchAllSales = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/sales/user/${user_id}`);
      setAllSales(response.data.sales || []);
    } catch {
      console.error("Error fetching sales:");
    }
  }, [user_id]);

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/receipts/${user_id}`);
      setData(response.data.receipts || []);
    } catch {
      console.error("Error fetching receipts:");
      Alert.alert("Error", "Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
    fetchAllSales();
  }, [fetchData, fetchAllSales]);

  const receiptFields = useMemo(() => {
    return RECEIPT_FIELDS_WITH_ITEMS.map((f) => {
      if (f.name === "linked_sale_id") {
        return {
          ...f,
          items: allSales.map((s) => s.sales_name || `Sale #${s.sales_id}`),
        };
      }
      return f;
    });
  }, [allSales]);

  const handleCreateReceipt = async (formData: any) => {
    setSubmitting(true);
    try {
      const items = formData.items || [];
      const payload = {
        user_id: Number(user_id),
        title: formData.title,
        bill_to: formData.billTo,
        due_date: formData.dueDate,
        receipt_number: formData.receiptNumber || null,
        payment_terms: formData.paymentTerms || null,
        notes: formData.notes || null,
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
        shipping: parseFloat(formData.shipping) || 0,
        items: items
          .map((i: any) => ({
            description: i.description || "",
            quantity: Number(i.quantity) || 0,
            rate: Number(i.price) || 0,
          }))
          .filter(
            (item: any) => item.description.trim() !== "" && item.quantity > 0
          ),
        linked_sale_id: formData.linked_sale_id
          ? allSales.find(
              (s) =>
                (s.sales_name || `Sale #${s.sales_id}`) ===
                formData.linked_sale_id
            )?.sales_id
          : null,
      };
      await axiosInstance.post("/receipts/add", payload);
      Alert.alert("Success", "Receipt created successfully.");
      setFormVisible(false);
      fetchData();
    } catch {
      console.error("Error creating receipt:");
      Alert.alert("Error", "Failed to create receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bill_to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PlatformLayout>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Receipts Ledger" />
        </Appbar.Header>

        <View className="flex-1 p-4">
          <Searchbar
            placeholder="Search receipts..."
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
              renderItem={({ item }) => (
                <ReceiptCard
                  item={item}
                  onPress={() =>
                    router.push(
                      `/${user_id}/receipts/${
                        item.invoice_id
                      }?data=${encodeURIComponent(JSON.stringify(item))}`
                    )
                  }
                />
              )}
              keyExtractor={(item) => item.invoice_id.toString()}
              contentContainerClassName="pb-20"
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center p-5">
                  <Text style={{ color: theme.colors.onSurfaceDisabled }}>
                    No receipts found.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <FAB
          icon="plus"
          label="Add Receipt"
          className="absolute right-4 bottom-4 rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <BottomDrawer
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Add New Receipt"
          onSubmit={handleCreateReceipt}
          isSubmitting={submitting}
          submitButtonText="Save Receipt"
          fields={receiptFields}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default FinanceReceipts;

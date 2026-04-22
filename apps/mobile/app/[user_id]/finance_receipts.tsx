import { Icon } from "@/components/ui/Icon";
import ReceiptForm, {
  ReceiptFormData,
} from "@/components/form/crm/ReceiptForm";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { FormModal } from "@/components/modals/FormModal";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";

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
  } catch (e) {
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
    <Card onPress={onPress} style={styles.card}>
      <Card.Title title={item.title} subtitle={`Billed to: ${item.bill_to}`} />
      <Card.Content>
        <View style={styles.cardRow}>
          <View style={styles.infoItem}>
            <Icon
              type={"calendar-month" as any}
              size={16}
              color={theme.colors.error}
            />
            <Text style={[styles.infoText, { color: theme.colors.error }]}>
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

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/receipts/${user_id}`);
      setData(response.data.receipts || []);
    } catch (err) {
      console.error("Error fetching receipts:", err);
      Alert.alert("Error", "Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateReceipt = async (formData: ReceiptFormData) => {
    setSubmitting(true);
    try {
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
        items: formData.items
          .map(({ description, quantity, rate }) => ({
            description,
            quantity: Number(quantity) || 0,
            rate: Number(rate) || 0,
          }))
          .filter(
            (item) => item.description.trim() !== "" && item.quantity > 0
          ),
        linked_sale_id: formData.linked_sale_id,
      };
      await axiosInstance.post("/receipts/add", payload);
      Alert.alert("Success", "Receipt created successfully.");
      setFormVisible(false);
      fetchData();
    } catch (err) {
      console.error("Error creating receipt:", err);
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
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
      >
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Receipts Ledger" />
        </Appbar.Header>

        <View style={styles.container}>
          <Searchbar
            placeholder="Search receipts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {loading ? (
            <View style={styles.centered}>
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
              contentContainerStyle={styles.listContent}
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.centered}>
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <ReceiptForm
          isVisible={isFormVisible}
          onSubmit={handleCreateReceipt}
          onClose={() => setFormVisible(false)}
          user_id={user_id}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  listContent: { paddingBottom: 80 },
  card: { marginBottom: 12, borderRadius: 12 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});

export default FinanceReceipts;

import { Icon } from "@/components/ui/Icon";
import ExpenseForm, { ExpenseFormData } from "@/components/form/finance/ExpenseForm";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { FormModal } from "@/components/modals/FormModal";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";

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
  } catch (e) {
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
    <Card style={styles.card}>
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
        <View style={styles.cardRow}>
          <View style={styles.infoItem}>
            <Icon type="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{formatDate(item.date_created)}</Text>
          </View>
          <Chip compact style={styles.categoryChip}>{item.category}</Chip>
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

  useEffect(() => {
    navigation.setOptions({ title: "Expense Ledger" });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/expenses/user/${user_id}`);
      setData(response.data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      Alert.alert("Error", "Failed to load expense records.");
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    } catch (err) {
      console.error("Error creating expense:", err);
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
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Expense Ledger" />
        </Appbar.Header>

        <View style={styles.container}>
          <Searchbar
            placeholder="Search expenses..."
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
              renderItem={({ item }) => <ExpenseCard item={item} />}
              keyExtractor={(item) => item.expense_id.toString()}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.centered}>
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <FormModal
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Log New Expense"
          onSubmit={() => {}}
          isSubmitting={submitting}
          submitButtonText="Save Expense"
        >
          <ExpenseForm
            userId={user_id!}
            onSubmit={handleCreateExpense}
          />
        </FormModal>
      </SafeAreaView>
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
  searchBar: { marginBottom: 16, borderRadius: 12, backgroundColor: "transparent" },
  listContent: { paddingBottom: 80 },
  card: { marginBottom: 12, borderRadius: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13 },
  categoryChip: { height: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});

export default FinanceExpenses;

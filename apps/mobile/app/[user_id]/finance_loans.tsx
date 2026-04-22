import { Icon } from "@/components/ui/Icon";
import LoanForm, { LoanFormData } from "@/components/form/finance/LoanForm";
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
  } catch (e) {
    return dateString;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const LoanCard = ({ item }: { item: LoanRecord }) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Title
        title={item.loan_name}
        subtitle={item.lender}
        right={() => (
          <Text variant="titleMedium" style={{ color: theme.colors.primary, marginRight: 16 }}>
            {formatCurrency(item.amount)}
          </Text>
        )}
      />
      <Card.Content>
        <View style={styles.cardRow}>
          <View style={styles.infoItem}>
            <Icon type="percent" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{item.interest_rate}% Interest</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon type="calendar" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{formatDate(item.start_date)}</Text>
          </View>
          <Chip compact style={styles.statusChip}>{item.status}</Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

const FinanceLoans = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const navigation = useNavigation();
  const theme = useTheme();
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
    } catch (err) {
      console.error("Error fetching loans:", err);
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
    } catch (err) {
      console.error("Error creating loan:", err);
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
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loan Management" />
        </Appbar.Header>

        <View style={styles.container}>
          <Searchbar
            placeholder="Search loans..."
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
              renderItem={({ item }) => <LoanCard item={item} />}
              keyExtractor={(item) => item.loan_id.toString()}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={{ color: theme.colors.onSurfaceDisabled }}>
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="white"
          onPress={() => setFormVisible(true)}
        />

        <FormModal
          isVisible={isFormVisible}
          onClose={() => setFormVisible(false)}
          title="Log New Loan"
          onSubmit={() => {}}
          isSubmitting={submitting}
          submitButtonText="Save Loan"
        >
          <LoanForm
            userId={user_id!}
            onSubmit={handleCreateLoan}
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
  statusChip: { height: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});

export default FinanceLoans;

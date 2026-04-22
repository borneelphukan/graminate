import { Icon } from "@/components/ui/Icon";
import { SALES_FIELDS_WITH_ITEMS } from "@/constants/formConfigs";
import BottomDrawer from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  } catch (e) {
    return dateString;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const SaleCard = ({ item }: { item: SaleRecord }) => {
  const theme = useTheme();
  const totalAmount = item.quantities_sold.reduce(
    (sum, q, i) => sum + q * (item.prices_per_unit[i] || 0),
    0
  );

  return (
    <Card style={styles.card}>
      <Card.Title
        title={item.sales_name || "Untitled Sale"}
        subtitle={item.occupation || "Uncategorized"}
        right={() => (
          <Text variant="titleMedium" style={{ color: theme.colors.primary, marginRight: 16 }}>
            {formatCurrency(totalAmount)}
          </Text>
        )}
      />
      <Card.Content>
        <View style={styles.cardRow}>
          <View style={styles.infoItem}>
            <Icon type="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.infoText}>{formatDate(item.sales_date)}</Text>
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
  const theme = useTheme();
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
    } catch (err) {
      console.error("Error fetching user sub_types:", err);
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
    } catch (err) {
      console.error("Error fetching sales:", err);
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
    } catch (err) {
      console.error("Error creating sale:", err);
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
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Sales Ledger" />
        </Appbar.Header>

        <View style={styles.container}>
          <Searchbar
            placeholder="Search sales..."
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
              renderItem={({ item }) => <SaleCard item={item} />}
              keyExtractor={(item) => item.sales_id.toString()}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchData}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={{ color: theme.colors.onSurfaceDisabled }}>
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
  searchBar: { marginBottom: 16, borderRadius: 12, backgroundColor: "transparent" },
  listContent: { paddingBottom: 80 },
  card: { marginBottom: 12, borderRadius: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoText: { fontSize: 13 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});

export default FinanceSales;

import { Icon } from "@/components/ui/Icon";
import {
  INVENTORY_FIELDS,
  InventoryFormData,
  WAREHOUSE_FIELDS,
  WarehouseFormData,
} from "@/constants/formConfigs";
import BottomDrawer from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Text,
  useTheme,
} from "react-native-paper";

type ItemRecord = {
  inventory_id: number;
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  created_at: string;
  price_per_unit: number;
  warehouse_id: number | null;
  minimum_limit?: number;
  status?: string;
};

type WarehouseDetails = {
  warehouse_id: number;
  user_id?: number;
  name: string;
  type: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_person: string | null;
  phone: string | null;
  storage_capacity: number | string | null;
  category?: string | null;
};

const screenWidth = Dimensions.get("window").width;
const isTablet = screenWidth >= 768;
const statBoxWidth = isTablet ? (screenWidth - 68) / 4 : (screenWidth - 44) / 2;

const getBarColor = (quantity: number, max: number): string => {
  if (max === 0) return "#9ca3af";
  const ratio = quantity / max;
  if (ratio < 0.25) return "#ef4444";
  if (ratio < 0.5) return "#f97316";
  if (ratio < 0.75) return "#eab308";
  return "#22c55e";
};

const WarehouseDetailScreen = () => {
  const router = useRouter();
  const {
    user_id,
    id,
    warehouseName: queryWarehouseName,
  } = useLocalSearchParams<{
    user_id: string;
    id: string;
    warehouseName?: string;
  }>();
  const theme = useTheme();

  const [inventory, setInventory] = useState<ItemRecord[]>([]);
  const [warehouseDetails, setWarehouseDetails] =
    useState<WarehouseDetails | null>(null);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [isWarehouseFormOpen, setIsWarehouseFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchWarehouseData = useCallback(async () => {
    if (!user_id || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [inventoryResponse, warehouseDetailsResponse] = await Promise.all([
        axiosInstance.get(`/inventory/${user_id}`, {
          params: { warehouse_id: id },
        }),
        axiosInstance.get(`/warehouse/user/${user_id}`),
      ]);
      setInventory(inventoryResponse.data.items || []);
      const warehouses = warehouseDetailsResponse.data.warehouses || [];
      const foundWarehouse = warehouses.find(
        (wh: WarehouseDetails) => wh.warehouse_id === parseInt(id, 10)
      );
      setWarehouseDetails(foundWarehouse || null);
    } catch (error) {
      console.error("Error fetching warehouse-specific data:", error);
    } finally {
      setLoading(false);
    }
  }, [user_id, id]);

  useEffect(() => {
    fetchWarehouseData();
    fetchUserSubTypes();
  }, [fetchWarehouseData, fetchUserSubTypes]);

  const inventoryFields = useMemo(() => {
    return INVENTORY_FIELDS.map((f) => {
      if (f.name === "itemGroup") {
        return { ...f, items: userSubTypes };
      }
      return f;
    });
  }, [userSubTypes]);

  const warehouseFields = useMemo(() => {
    return WAREHOUSE_FIELDS.map((f) => {
      if (f.name === "category") {
        return { ...f, type: "dropdown" as const, items: userSubTypes };
      }
      return f;
    });
  }, [userSubTypes]);

  const handleUpdateWarehouse = async (data: WarehouseFormData) => {
    if (!id) {
      Alert.alert("Error", "Warehouse ID is missing.");
      return;
    }
    const payload = {
      ...data,
      storage_capacity: data.storage_capacity
        ? parseFloat(data.storage_capacity)
        : null,
    };
    try {
      await axiosInstance.put(`/warehouse/update/${id}`, payload);
      Alert.alert("Success", "Warehouse updated successfully!");
      await fetchWarehouseData();
    } catch (error) {
      Alert.alert("Error", "Failed to update warehouse.");
      throw error;
    }
  };

  const handleAddItem = async (data: InventoryFormData) => {
    if (!user_id || !id) {
      Alert.alert("Error", "User or Warehouse ID is missing.");
      return;
    }
    const payload = {
      user_id: Number(user_id),
      warehouse_id: Number(id),
      item_name: data.itemName,
      item_group: data.itemGroup,
      units: data.units,
      quantity: Number(data.quantity),
      price_per_unit: Number(data.pricePerUnit),
      minimum_limit: data.minimumLimit ? Number(data.minimumLimit) : undefined,
      feed: data.feed,
    };
    try {
      await axiosInstance.post(`/inventory/add`, payload);
      Alert.alert("Success", "Item added to warehouse successfully!");
      await fetchWarehouseData();
    } catch (error) {
      Alert.alert("Error", "Failed to add item.");
      throw error;
    }
  };

  const warehouseName =
    warehouseDetails?.name || queryWarehouseName || "Warehouse";
  const totalAssetValue = useMemo(
    () =>
      inventory.reduce(
        (acc, item) =>
          acc + (Number(item.price_per_unit) || 0) * (item.quantity || 0),
        0
      ),
    [inventory]
  );
  const lowStockItems = useMemo(
    () =>
      inventory.filter(
        (item) =>
          item.minimum_limit != null &&
          item.minimum_limit > 0 &&
          item.quantity < item.minimum_limit
      ),
    [inventory]
  );

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) =>
      `rgba(${theme.dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    labelColor: (opacity = 1) =>
      `rgba(${theme.dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
    barPercentage: 0.8,
  };

  const barChartData = useMemo(() => {
    const labels = inventory.map((item) => item.item_name.substring(0, 10));
    const quantities = inventory.map((item) => item.quantity);
    const maxQuantity = Math.max(0, ...quantities);
    const barColors = quantities.map((q) => () => getBarColor(q, maxQuantity));
    return {
      labels: labels.length > 0 ? labels : ["No Items"],
      datasets: [
        {
          data: quantities.length > 0 ? quantities : [0],
          colors: barColors.length > 0 ? barColors : [() => "#9ca3af"],
        },
      ],
    };
  }, [inventory]);

  const chartWidth = useMemo(
    () => Math.max(screenWidth - 64, inventory.length * 60),
    [inventory.length]
  );

  if (loading) {
    return (
      <PlatformLayout>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.Action
            icon={() => (
              <Icon
                type={"arrow-left" as any}
                size={22}
                color={theme.colors.onSurface}
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"arrow-left" as any}
              size={22}
              color={theme.colors.onSurface}
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title={warehouseName}
          titleStyle={[styles.appbarTitle, { fontWeight: "bold" }]}
          subtitle={`${inventory.length} Item(s)`}
        />
      </Appbar.Header>

      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <Button
            mode="outlined"
            onPress={() => setIsWarehouseFormOpen(true)}
            style={styles.actionButton}
            contentStyle={{ height: 44 }}
            icon={() => (
              <Icon
                type={"pencil" as any}
                size={18}
                color={theme.colors.primary}
              />
            )}
          >
            Edit Facility
          </Button>
          <Button
            mode="contained"
            icon={() => (
              <Icon
                type={"plus" as any}
                size={18}
                color={theme.colors.onPrimary}
              />
            )}
            onPress={() => setIsInventoryFormOpen(true)}
            style={styles.actionButton}
            contentStyle={{ height: 44 }}
          >
            Add Item
          </Button>
        </View>

        {/* Stats Summary Grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.statsScroll}
          contentContainerStyle={styles.statsGrid}
        >
          <View style={styles.statBox}>
            <Text variant="labelSmall" style={styles.statLabel}>TOTAL ITEMS</Text>
            <Text variant="titleLarge" style={styles.statValue}>{inventory.length}</Text>
            <Text variant="bodySmall" style={styles.statSub}>In storage</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelSmall" style={styles.statLabel}>ASSET VALUE</Text>
            <Text variant="titleLarge" style={styles.statValue}>
              ₹{(totalAssetValue / 1000).toFixed(1)}k
            </Text>
            <Text variant="bodySmall" style={styles.statSub}>Estimated total</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelSmall" style={styles.statLabel}>LOW STOCK</Text>
            <Text variant="titleLarge" style={[styles.statValue, lowStockItems.length > 0 && { color: theme.colors.error }]}>
              {lowStockItems.length}
            </Text>
            <Text variant="bodySmall" style={styles.statSub}>Need attention</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="labelSmall" style={styles.statLabel}>CAPACITY</Text>
            <Text variant="titleLarge" style={styles.statValue}>
              {warehouseDetails?.storage_capacity || "N/A"}
            </Text>
            <Text variant="bodySmall" style={styles.statSub}>sq. ft. area</Text>
          </View>
        </ScrollView>

        {/* Facility Info Card */}
        {warehouseDetails && (
          <Card style={styles.infoCard} elevation={1}>
            <Card.Content>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Icon type="warehouse" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text variant="labelSmall" style={styles.infoLabel}>TYPE</Text>
                  <Text variant="bodyLarge" style={styles.infoValue}>{warehouseDetails.type}</Text>
                </View>
              </View>

              {warehouseDetails.storage_capacity && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Icon type="package-variant-closed" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text variant="labelSmall" style={styles.infoLabel}>STORAGE AREA</Text>
                    <Text variant="bodyLarge" style={styles.infoValue}>{warehouseDetails.storage_capacity} sq. ft.</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Icon type="map-marker" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text variant="labelSmall" style={styles.infoLabel}>ADDRESS</Text>
                  <Text variant="bodyMedium" style={styles.infoValue}>
                    {[warehouseDetails.address_line_1, warehouseDetails.city, warehouseDetails.state]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              </View>

              {(warehouseDetails.contact_person || warehouseDetails.phone) && (
                <View style={styles.contactSection}>
                  <View style={styles.infoRow}>
                    <Icon type="account" size={16} color={theme.colors.outline} />
                    <Text variant="bodySmall" style={styles.contactText}>
                      {warehouseDetails.contact_person || "No manager assigned"}
                    </Text>
                  </View>
                  {warehouseDetails.phone && (
                    <View style={styles.infoRow}>
                      <Icon type="phone" size={16} color={theme.colors.outline} />
                      <Text variant="bodySmall" style={styles.contactText}>{warehouseDetails.phone}</Text>
                    </View>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Analytics Section */}
        {inventory.length > 0 && (
          <View style={styles.chartSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Stock Distribution</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={barChartData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                withCustomBarColorFromData
                flatColor
                showBarTops={false}
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Icon type="alert" size={18} color={theme.colors.error} />
              <Text variant="titleSmall" style={[styles.alertTitle, { color: theme.colors.error }]}>
                Critical Stock Alerts
              </Text>
            </View>
            {lowStockItems.map((item) => (
              <View key={item.inventory_id} style={styles.alertItem}>
                <Text style={styles.alertItemText}>{item.item_name}</Text>
                <Text style={[styles.alertQty, { color: theme.colors.error }]}>
                  {item.quantity} / {item.minimum_limit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Inventory List */}
        <View style={styles.inventoryContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Detailed Inventory</Text>
          {inventory.length > 0 ? (
            inventory.map((item) => {
              const isLowStock =
                item.minimum_limit != null &&
                item.quantity < item.minimum_limit;
              return (
                <Card key={item.inventory_id} style={styles.inventoryCard} mode="contained">
                  <Card.Content>
                    <View style={styles.itemHeader}>
                      <View>
                        <Text variant="titleMedium" style={styles.itemName}>{item.item_name}</Text>
                        <Text variant="bodySmall" style={styles.itemGroup}>{item.item_group}</Text>
                      </View>
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceLabel}>₹</Text>
                        <Text style={styles.priceValue}>{(Number(item.price_per_unit) || 0).toFixed(0)}</Text>
                      </View>
                    </View>

                    <View style={styles.itemFooter}>
                      <View style={styles.qtyContainer}>
                        <Icon type="package-variant" size={14} color={theme.colors.outline} />
                        <Text variant="bodyMedium" style={styles.qtyText}>
                          {item.quantity} {item.units}
                        </Text>
                      </View>
                      {isLowStock && (
                        <View style={[styles.lowStockBadge, { backgroundColor: theme.colors.errorContainer }]}>
                          <Text style={[styles.lowStockText, { color: theme.colors.error }]}>LOW</Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Icon type="package-variant-closed" size={48} color={theme.colors.outlineVariant} />
              <Text variant="bodyMedium" style={styles.emptyText}>No items found in this facility.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomDrawer
        isVisible={isInventoryFormOpen}
        onClose={() => setIsInventoryFormOpen(false)}
        onSubmit={handleAddItem}
        title={`Add Item to ${warehouseName}`}
        fields={inventoryFields}
      />
      <BottomDrawer
        isVisible={isWarehouseFormOpen}
        onClose={() => setIsWarehouseFormOpen(false)}
        onSubmit={handleUpdateWarehouse}
        initialValues={warehouseDetails || undefined}
        title={`Edit ${warehouseName}`}
        fields={warehouseFields}
      />
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appbarTitle: { fontSize: 18 },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  statsScroll: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  statBox: {
    width: statBoxWidth,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statValue: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  statSub: {
    opacity: 0.5,
    fontSize: 10,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "white",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    opacity: 0.5,
    letterSpacing: 1,
  },
  infoValue: {
    fontWeight: "600",
  },
  contactSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  contactText: {
    opacity: 0.7,
  },
  chartSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  alertSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  alertItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  alertQty: {
    fontSize: 12,
    fontWeight: "bold",
  },
  inventoryContainer: {
    paddingHorizontal: 16,
  },
  inventoryCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  itemName: {
    fontWeight: "bold",
  },
  itemGroup: {
    opacity: 0.5,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qtyText: {
    fontWeight: "500",
  },
  lowStockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    opacity: 0.4,
  },
});

export default WarehouseDetailScreen;

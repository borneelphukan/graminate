import { Icon } from "@/components/ui/Icon";
import {
  INVENTORY_FIELDS,
  InventoryFormData,
  WAREHOUSE_FIELDS,
  WarehouseFormData,
} from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, ScrollView, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Text,
} from "@/components/ui";

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
    } catch {
      console.error("Error fetching user sub_types:");
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
    } catch {
      console.error("Error fetching warehouse-specific data:");
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
    } catch {
      Alert.alert("Error", "Failed to update warehouse.");
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
    } catch {
      Alert.alert("Error", "Failed to add item.");
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
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray-400
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray-400
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
        <Appbar.Header className="bg-white dark:bg-gray-800">
          <Appbar.Action
            icon={() => (
              <Icon
                type={"chevron-left" as any}
                size={22}
                className="text-black dark:text-white"
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Appbar.Header className="bg-white dark:bg-gray-800">
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left" as any}
              size={22}
              className="text-black dark:text-white"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title={warehouseName}
          titleStyle={{ fontWeight: "bold" }}
          subtitle={`${inventory.length} Item(s)`}
        />
      </Appbar.Header>

      <ScrollView
        className="bg-white dark:bg-gray-900"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Actions */}
        <View className="flex-row gap-3 p-4">
          <Button
            mode="outlined"
            onPress={() => setIsWarehouseFormOpen(true)}
            className="flex-1 rounded-xl"
            contentStyle={{ height: 44 }}
            icon={() => (
              <Icon
                type={"pencil" as any}
                size={18}
                className="text-emerald-600"
              />
            )}
          >
            Edit Facility
          </Button>
          <Button
            mode="contained"
            icon={() => (
              <Icon
                type="plus"
                size={18}
                className="text-white"
              />
            )}
            onPress={() => setIsInventoryFormOpen(true)}
            className="flex-1 rounded-xl"
            contentStyle={{ height: 44 }}
          >
            Add Item
          </Button>
        </View>

        {/* Stats Summary Grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-4"
          contentContainerClassName="flex-row gap-3 px-4"
        >
          <View className="w-40 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-400 dark:border-gray-700">
            <Text className="mb-2 font-semibold tracking-wider">TOTAL ITEMS</Text>
            <Text className="font-bold mb-1">{inventory.length}</Text>
            <Text className="text-xs">In storage</Text>
          </View>
          <View className="w-40 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-400 dark:border-gray-700">
            <Text className="mb-2 font-semibold tracking-wider">ASSET VALUE</Text>
            <Text className="font-bold mb-1">
              ₹{(totalAssetValue / 1000).toFixed(1)}k
            </Text>
            <Text className="text-xs">Estimated total</Text>
          </View>
          <View className="w-40 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-400 dark:border-gray-700">
            <Text className="mb-2 font-semibold tracking-wider">LOW STOCK</Text>
            <Text className={`font-bold mb-1 ${lowStockItems.length > 0 ? "text-red-600" : ""}`}>
              {lowStockItems.length}
            </Text>
            <Text className="text-xs">Need attention</Text>
          </View>
          <View className="w-40 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-400 dark:border-gray-700">
            <Text className="mb-2 font-semibold tracking-wider">CAPACITY</Text>
            <Text className="font-bold mb-1">
              {warehouseDetails?.storage_capacity || "N/A"}
            </Text>
            <Text className="text-xs">sq. ft. area</Text>
          </View>
        </ScrollView>

        {/* Facility Info Card */}
        {warehouseDetails && (
          <Card className="mx-4 mb-6 rounded-2xl bg-white dark:bg-gray-800" elevation={1}>
            <Card.Content>
              <View className="flex-row items-center mb-4 gap-3">
                <View className="w-9 h-9 rounded-xl bg-gray-400 dark:bg-gray-700 justify-center items-center">
                  <Icon type="warehouse" size={20} className="text-emerald-600" />
                </View>
                <View className="flex-1">
                  <Text className="uppercase">Type</Text>
                  <Text className="font-semibold">{warehouseDetails.type}</Text>
                </View>
              </View>

              {warehouseDetails.storage_capacity && (
                <View className="flex-row items-center mb-4 gap-3">
                  <View className="w-9 h-9 rounded-xl bg-gray-400 dark:bg-gray-700 justify-center items-center">
                    <Icon type="package-variant-closed" size={20} className="text-emerald-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="uppercase">Storage Area</Text>
                    <Text className="font-semibold">{warehouseDetails.storage_capacity} sq. ft.</Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center mb-4 gap-3">
                <View className="w-9 h-9 rounded-xl bg-gray-400 dark:bg-gray-700 justify-center items-center">
                  <Icon type="map-marker" size={20} className="text-emerald-600" />
                </View>
                <View className="flex-1">
                  <Text className="uppercase">Address</Text>
                  <Text className="font-semibold">
                    {[warehouseDetails.address_line_1, warehouseDetails.city, warehouseDetails.state]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              </View>

              {(warehouseDetails.contact_person || warehouseDetails.phone) && (
                <View className="mt-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <View className="flex-row items-center mb-4 gap-3">
                    <Icon type="account" size={16} className="text-gray-400" />
                    <Text className="opacity-70">
                      {warehouseDetails.contact_person || "No manager assigned"}
                    </Text>
                  </View>
                  {warehouseDetails.phone && (
                    <View className="flex-row items-center mb-4 gap-3">
                      <Icon type="phone" size={16} className="text-gray-400" />
                      <Text className="opacity-70">{warehouseDetails.phone}</Text>
                    </View>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Analytics Section */}
        {inventory.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="font-bold mb-4">Stock Distribution</Text>
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
                style={{
                  borderRadius: 16,
                }}
              />
            </ScrollView>
          </View>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View className="mx-4 mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
            <View className="flex-row items-center gap-2 mb-3">
              <Icon type="alert" size={18} className="text-red-600" />
              <Text className="font-bold uppercase tracking-wider text-red-600">
                Critical Stock Alerts
              </Text>
            </View>
            {lowStockItems.map((item) => (
              <View key={item.inventory_id} className="flex-row justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                <Text className="text-sm font-medium text-black dark:text-white">{item.item_name}</Text>
                <Text className="text-xs font-bold text-red-600">
                  {item.quantity} / {item.minimum_limit}
                </Text>
              </View>
            ))}
          </View>
        )}        {/* Inventory List */}
        <View className="px-4">
          <Text className="font-bold mb-4">Detailed Inventory</Text>
          {inventory.length > 0 ? (
            inventory.map((item) => {
              const isLowStock =
                item.minimum_limit != null &&
                item.quantity < item.minimum_limit;
              return (
                <Card key={item.inventory_id} className="mb-3 rounded-2xl bg-white dark:bg-gray-800" mode="contained">
                  <Card.Content>
                    <View className="flex-row justify-between items-start mb-4">
                      <View>
                        <Text className="font-bold">{item.item_name}</Text>
                        <Text className="opacity-50">{item.item_group}</Text>
                      </View>
                      <View className="flex-row items-baseline bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                        <Text className="text-[10px] opacity-60 mr-0.5">₹</Text>
                        <Text className="text-sm font-bold text-black dark:text-white">{(Number(item.price_per_unit) || 0).toFixed(0)}</Text>
                      </View>
                    </View>
 
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-1.5">
                        <Icon type="package-variant" size={14} className="text-gray-400" />
                        <Text className="font-medium text-black dark:text-white">
                          {item.quantity} {item.units}
                        </Text>
                      </View>
                      {isLowStock && (
                        <View className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30">
                          <Text className="text-[10px] font-bold text-red-600">LOW</Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          ) : (
            <View className="items-center py-10 gap-3">
              <Icon type="package-variant-closed" size={48} className="text-gray-200" />
              <Text className="opacity-40">No items found in this facility.</Text>
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

export default WarehouseDetailScreen;

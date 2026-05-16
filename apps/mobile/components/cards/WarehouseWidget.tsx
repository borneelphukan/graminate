import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Modal,
  Portal,
  Divider,
  Button,
  Badge,
} from "@/components/ui";
import { Icon } from "../ui/Icon";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type WarehouseRecord = {
  warehouse_id: number;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
  storage_capacity: number | string | null;
  contact_person: string | null;
  phone: string | null;
  category?: string | null;
  items?: ItemRecord[];
};

type ItemRecord = {
  inventory_id: number;
  item_name: string;
  quantity: number;
  units: string;
  warehouse_id: number | null;
};

interface WarehouseWidgetProps {
  userId: string;
  serviceName: string;
}

const WarehouseWidget = ({ userId, serviceName }: WarehouseWidgetProps) => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (warehouse: WarehouseRecord) => {
    setSelectedWarehouse(warehouse);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedWarehouse(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const [warehouseRes, inventoryRes] = await Promise.all([
          axios.get(`${API_URL}/warehouse/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/inventory/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { item_group: serviceName },
          }),
        ]);

        const allWarehouses: WarehouseRecord[] =
          warehouseRes.data.warehouses || [];
        const allItems: ItemRecord[] = inventoryRes.data.items || [];

        const filteredWarehouses = allWarehouses.filter(
          (w) =>
            w.category === serviceName ||
            w.name.toLowerCase().includes(serviceName.toLowerCase()),
        );

        const warehousesWithItems = filteredWarehouses.map((w) => ({
          ...w,
          items: allItems.filter(
            (item) => item.warehouse_id === w.warehouse_id,
          ),
        }));

        setWarehouses(warehousesWithItems);
      } catch (error) {
        console.error(
          "Error fetching warehouse data for mobile widget:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, serviceName]);

  if (loading) return <ActivityIndicator className="m-5" />;
  if (warehouses.length === 0) return null;

  return (
    <View className="my-3">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <View className="flex-row items-center gap-3">
          <View className="p-2 rounded-xl bg-gray-400 dark:bg-gray-800">
            <Icon type="warehouse" size={24} />
          </View>
          <View>
            <Text className="font-bold">Associated Storage</Text>
            <Text className="text-dark dark:text-light">
              Warehouse for {serviceName}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/${userId}/storage` as any)}
        >
          <Text className="text-dark dark:text-light">View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="w-full"
        style={warehouses.length > 2 ? { maxHeight: 280 } : undefined}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {warehouses.map((warehouse) => (
          <Card
            key={warehouse.warehouse_id}
            className="mb-3"
            onPress={() =>
              router.push(
                `/${userId}/warehouse/${warehouse.warehouse_id}` as any,
              )
            }
          >
            <Card.Content>
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold mb-1">{warehouse.name}</Text>
                  <View className="flex-row items-center gap-1">
                    <Icon
                      type={"map-marker"}
                      size={14}
                      className="text-dark dark:text-light"
                    />
                    <Text className="opacity-70 text-dark dark:text-light">
                      {warehouse.city}, {warehouse.state}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Badge className="bg-green-300 dark:bg-green-100 px-2 py-0.5 rounded-lg">
                    {warehouse.type.split(" ")[0]}
                  </Badge>
                </View>
              </View>

              {warehouse.items && warehouse.items.length > 0 ? (
                <TouchableOpacity
                  className="mt-3 pt-3 border-t border-gray-400 dark:border-gray-700"
                  onPress={(e) => {
                    e.stopPropagation();
                    showModal(warehouse);
                  }}
                >
                  <View className="flex-row items-center gap-1 mb-2">
                    <Icon
                      type={"inventory"}
                      size={12}
                      className="text-dark dark:text-light"
                    />
                    <Text className="font-bold opacity-60 text-dark dark:text-light">
                      STOCK ({warehouse.items.length})
                    </Text>
                    <Icon
                      type={"chevron-right"}
                      size={12}
                      className="text-dark dark:text-light ml-auto"
                    />
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {warehouse.items.slice(0, 2).map((item) => (
                      <View
                        key={item.inventory_id}
                        className="flex-row justify-between items-center px-2 py-1 rounded-md flex-1 min-w-[45%] bg-gray-400 dark:bg-gray-800"
                      >
                        <Text
                          numberOfLines={1}
                          className="flex-1 mr-1 opacity-80"
                        >
                          {item.item_name}
                        </Text>
                        <Text className="font-bold">
                          {item.quantity} {item.units.split(" ")[0]}
                        </Text>
                      </View>
                    ))}
                    {warehouse.items.length > 2 && (
                      <Text className="w-full text-center mt-1 opacity-60 italic">
                        + {warehouse.items.length - 2} more items
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="mt-3 pt-3 border-t border-gray-400 dark:border-gray-700 items-center">
                  <Text className="opacity-40 text-dark dark:text-light">
                    No items mapped
                  </Text>
                </View>
              )}

              <View className="mt-3 pt-3 border-t border-gray-400 dark:border-gray-700 flex-row justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Icon
                    type={"account"}
                    size={16}
                    className="text-dark dark:text-light"
                  />
                  <Text className="text-dark dark:text-light">
                    {warehouse.contact_person || "N/A"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Icon
                    type={"phone"}
                    size={16}
                    className="text-dark dark:text-light"
                  />
                  <Text className="opacity-70 text-dark dark:text-light">
                    {warehouse.phone || "N/A"}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          className="m-5 p-5 rounded-2xl bg-gray-500 dark:bg-gray-700"
        >
          {selectedWarehouse && (
            <View>
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="font-bold">{selectedWarehouse.name}</Text>
                  <Text className="opacity-60">Stock Inventory</Text>
                </View>
                <TouchableOpacity onPress={hideModal} className="p-1">
                  <Icon
                    type="close"
                    size={24}
                    className="text-gray-200 dark:text-gray-300"
                  />
                </TouchableOpacity>
              </View>

              <Divider className="my-3" />

              <ScrollView className="my-2">
                {selectedWarehouse.items?.map((item) => (
                  <View
                    key={item.inventory_id}
                    className="flex-row justify-between items-center py-3 border-b border-gray-50 dark:border-gray-900"
                  >
                    <View className="flex-1">
                      <Text className="font-medium">{item.item_name}</Text>
                      <Text className="opacity-50">{serviceName} Item</Text>
                    </View>
                    <View className="items-end bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl">
                      <Text className="font-bold text-green-100 dark:text-green-200">
                        {item.quantity}
                      </Text>
                      <Text className="opacity-60 text-sm text-dark dark:text-light">
                        {item.units}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Divider className="my-3" />

              <Button
                mode="contained"
                className="mt-2 rounded-xl"
                onPress={() => {
                  hideModal();
                  router.push(
                    `/${userId}/warehouse/${selectedWarehouse.warehouse_id}` as any,
                  );
                }}
              >
                View More Details
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default WarehouseWidget;

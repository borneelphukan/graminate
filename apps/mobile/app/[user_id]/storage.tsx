import { Icon } from "@/components/ui/Icon";
import { WAREHOUSE_FIELDS, WarehouseFormData } from "@/constants/formConfigs";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import PlatformLayout from "@/components/layout/PlatformLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { isAxiosError } from "axios";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  FAB,
  Searchbar,
  Text,
} from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const api = axios.create({ baseURL: API_URL });

type WarehouseRecord = {
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
};

const WarehouseCard = ({
  item,
  onPress,
}: {
  item: WarehouseRecord;
  onPress: () => void;
}) => {
  const addressString = [
    item.address_line_1,
    item.address_line_2,
    item.city,
    item.state,
    item.postal_code,
    item.country,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <Card onPress={onPress} className="mb-3">
      <Card.Title
        title={item.name}
        titleVariant="titleLarge"
        right={() => <Chip className="mr-2">{item.type}</Chip>}
      />
      <Card.Content>
        {!!addressString && (
          <View className="flex-row items-center mt-2 mr-4">
            <Icon
              type={"map-marker" as any}
              size={16}
              className="text-gray-400 dark:text-gray-500"
            />
            <Text variant="bodyMedium" className="ml-2 shrink">
              {addressString}
            </Text>
          </View>
        )}
        <View className="flex-row flex-wrap mt-2 pt-2 border-t border-black/10">
          {item.contact_person && (
            <View className="flex-row items-center mt-2 mr-4">
              <Icon
                type={"account" as any}
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              <Text variant="bodyMedium" className="ml-2 shrink">
                {item.contact_person}
              </Text>
            </View>
          )}
          {item.phone && (
            <View className="flex-row items-center mt-2 mr-4">
              <Icon
                type={"phone" as any}
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              <Text variant="bodyMedium" className="ml-2 shrink">
                {item.phone}
              </Text>
            </View>
          )}
          {item.storage_capacity != null && (
            <View className="flex-row items-center mt-2 mr-4">
              <Icon
                type={"package-variant-closed" as any}
                size={16}
                className="text-gray-400 dark:text-gray-500"
              />
              <Text variant="bodyMedium" className="ml-2 shrink">
                {String(item.storage_capacity)}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const StoragePage = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [userSubTypes, setUserSubTypes] = useState<string[]>([]);

  const fetchUserSubTypes = useCallback(async () => {
    if (!user_id) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      const response = await api.get(`/user/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data?.data?.user ?? response.data?.user;
      setUserSubTypes(Array.isArray(user?.sub_type) ? user.sub_type : []);
    } catch {
      console.error("Error fetching user sub_types:");
    }
  }, [user_id]);

  const fetchWarehouses = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found.");
      const response = await api.get(`/warehouse/user/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(
        Array.isArray(response.data?.warehouses) ? response.data.warehouses : []
      );
    } catch (err: any) {
      const errorMessage = isAxiosError(err)
        ? err.response?.data?.message || "Failed to connect"
        : err.message || "An unexpected error occurred.";
      setError(errorMessage);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useFocusEffect(
    useCallback(() => {
      fetchWarehouses();
      fetchUserSubTypes();
    }, [fetchWarehouses, fetchUserSubTypes])
  );

  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    if (!user_id) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("Authentication token not found.");
      const payload = {
        ...data,
        user_id: Number(user_id),
        storage_capacity: data.storage_capacity
          ? parseFloat(data.storage_capacity)
          : null,
      };
      await api.post("/warehouse/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "Warehouse created successfully.");
      await fetchWarehouses();
    } catch (err) {
      const errorMessage = isAxiosError(err)
        ? err.response?.data?.message || "An API error occurred"
        : "An unexpected error occurred.";
      Alert.alert("Creation Failed", errorMessage);
      throw err;
    }
  };

  const handleRowClick = (item: WarehouseRecord) => {
    if (!user_id) {
      Alert.alert("Error", "Cannot navigate: User ID is missing.");
      return;
    }
    router.push({
      pathname: "/[user_id]/warehouse/[id]",
      params: { user_id, id: item.warehouse_id, warehouseName: item.name },
    });
  };

  const filteredWarehouses = useMemo(() => {
    if (!searchQuery) return warehouses;
    return warehouses.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      const addressString = [
        item.address_line_1,
        item.address_line_2,
        item.city,
        item.state,
        item.postal_code,
        item.country,
      ]
        .filter(Boolean)
        .join(", ")
        .toLowerCase();
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        addressString.includes(searchTerm) ||
        (item.contact_person &&
          item.contact_person.toLowerCase().includes(searchTerm)) ||
        (item.phone && item.phone.toLowerCase().includes(searchTerm)) ||
        (item.storage_capacity &&
          String(item.storage_capacity).toLowerCase().includes(searchTerm))
      );
    });
  }, [warehouses, searchQuery]);

  const warehouseFields = useMemo(() => {
    return WAREHOUSE_FIELDS.map((f) => {
      if (f.name === "category") {
        return { ...f, type: "dropdown" as const, items: userSubTypes };
      }
      return f;
    });
  }, [userSubTypes]);

  const renderContent = () => {
    if (!user_id)
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4 text-center">
          <Text className="text-red-600 dark:text-red-400">User ID not found.</Text>
        </View>
      );
    if (loading && warehouses.length === 0)
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4 text-center">
          <ActivityIndicator size="large" />
        </View>
      );
    if (error)
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4 text-center">
          <Text className="text-red-600 dark:text-red-400">{error}</Text>
          <Button onPress={fetchWarehouses}>Retry</Button>
        </View>
      );
    if (filteredWarehouses.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-4 gap-4 text-center">
          <Icon
            type={"warehouse" as any}
            size={64}
            className="text-gray-300 dark:text-gray-700"
          />
          <Text className="text-gray-400 dark:text-gray-600">
            {searchQuery
              ? `No warehouses found for "${searchQuery}"`
              : "No warehouses found. Tap &apos;+&apos; to add one."}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredWarehouses}
        renderItem={({ item }) => (
          <WarehouseCard item={item} onPress={() => handleRowClick(item)} />
        )}
        keyExtractor={(item) => item.warehouse_id.toString()}
        onRefresh={fetchWarehouses}
        refreshing={loading}
        contentContainerClassName="p-4 pb-20"
      />
    );
  };

  return (
    <PlatformLayout>
      <SafeAreaView
        className="flex-1 bg-white dark:bg-dark"
      >
        <Appbar.Header>
          <Appbar.Action
            icon={() => (
              <Icon
                type={"chevron-left" as any}
                size={22}
                className="text-dark dark:text-light"
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content
            title="Warehouses"
            subtitle={`${
              loading ? "Loading..." : `${filteredWarehouses.length} Record(s)`
            }`}
          />
        </Appbar.Header>
        <Searchbar
          placeholder="Search warehouses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mx-4 mt-2"
        />
        {renderContent()}
        <FAB
          icon={() => (
            <Icon
              type={"plus" as any}
              size={22}
              color="white"
            />
          )}
          className="absolute right-4 bottom-4 bg-green-100"
          onPress={() => setIsFormVisible(true)}
        />
        <BottomDrawer
          isVisible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          onSubmit={handleCreateWarehouse}
          title="Add New Warehouse"
          fields={warehouseFields}
        />
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default StoragePage;

import { Icon } from "@/components/ui/Icon";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Chip,
  Text,
  TouchableRipple,
} from "@/components/ui";
import axiosInstance from "@/lib/axiosInstance";

type ItemRecord = {
  inventory_id: number;
  item_name: string;
  units: string;
  quantity: number;
  minimum_limit?: number;
};

type InventoryStockProps = {
  userId: string | undefined;
  title: string;
  category: string;
};

const InventoryStockCard = ({
  userId,
  title,
  category,
}: InventoryStockProps) => {
  const [inventoryItems, setInventoryItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantitySortAsc, setQuantitySortAsc] = useState(false);

  const sortItems = useCallback((list: ItemRecord[], asc: boolean) => {
    return [...list].sort((a, b) => {
      return asc ? a.quantity - b.quantity : b.quantity - a.quantity;
    });
  }, []);

  useEffect(() => {
    if (!userId || !category) {
      setLoading(false);
      setError("User ID or category not provided.");
      return;
    }
    const fetchInventoryItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/inventory/${userId}`, {
          params: { item_group: category },
        });
        const items = response.data.items || [];
        setInventoryItems(sortItems(items, quantitySortAsc));
      } catch {
        setError(`Failed to load ${category.toLowerCase()} inventory data.`);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryItems();
  }, [userId, category, quantitySortAsc, sortItems]);

  const getItemStatus = (item: ItemRecord) => {
    const { quantity, minimum_limit } = item;
    if (quantity === 0)
      return {
        text: "Unavailable",
        bg: "bg-red-100 dark:bg-red-900",
        text_color: "text-red-700 dark:text-red-300",
      };
    const effectiveMinLimit = minimum_limit ?? 0;
    if (effectiveMinLimit > 0 && quantity < effectiveMinLimit)
      return {
        text: "Limited",
        bg: "bg-orange-100 dark:bg-orange-900",
        text_color: "text-orange-700 dark:text-orange-300",
      };
    return {
      text: "Available",
      bg: "bg-green-100 dark:bg-green-900",
      text_color: "text-green-700 dark:text-green-300",
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center gap-3">
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center gap-3">
          <Text className="text-red-600">{error}</Text>
        </View>
      );
    }

    if (inventoryItems.length === 0) {
      return (
        <View className="flex-1 justify-center items-center gap-3">
          <Icon
            type={"archive" as any}
            size={48}
            className="text-gray-400"
          />
          <Text className="mt-3 text-center text-gray-400">
            No items for {category}.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {inventoryItems.map((item) => {
          const status = getItemStatus(item);
          return (
            <View key={item.inventory_id} className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <Text
                className="flex-1 text-sm text-black dark:text-white"
                numberOfLines={1}
              >
                {item.item_name}
              </Text>
              <Text className="font-bold mx-4 text-black dark:text-white">
                {item.quantity} {item.units}
              </Text>
              <Chip
                className={status.bg}
                textStyle={{ color: "inherit" }} // NativeWind handles classes on Chip? No, typically textStyle is needed.
                // Wait, if I use className on Chip, it might not affect text.
              >
                <Text className={status.text_color}>{status.text}</Text>
              </Chip>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View className="h-[320px] rounded-lg p-6 shadow-md bg-white dark:bg-gray-900">
      <View className="flex-row justify-between items-center mb-4">
        <Text>
          {title}
        </Text>
        <TouchableRipple
          onPress={() => {
            const newAsc = !quantitySortAsc;
            setQuantitySortAsc(newAsc);
            setInventoryItems((prev) => sortItems(prev, newAsc));
          }}
          className="py-1 px-2 rounded bg-gray-200 dark:bg-gray-800"
        >
          <View className="flex-row items-center">
            <Text className="text-xs font-medium mr-2">
              Quantity
            </Text>
            <Icon
              type={(quantitySortAsc ? "chevron-up" : "chevron-down") as any}
              size={12}
              className="text-black dark:text-white"
            />
          </View>
        </TouchableRipple>
      </View>

      <View className="flex-1 overflow-hidden">{renderContent()}</View>
    </View>
  );
};

export default InventoryStockCard;

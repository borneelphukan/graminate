import React from "react";
import { View } from "react-native";
import { Appbar, List, Text } from "@/components/ui";

export type NotificationProps = {
  id: number;
  title: string;
  description: string;
  darkMode?: boolean;
  onRemove?: (id: number) => void;
};

export const Notification = ({
  id,
  title,
  description,
  onRemove,
}: NotificationProps) => {
  return (
    <List.Item
      title={title}
      description={description}
      titleStyle={{ fontWeight: "800", fontSize: 14, marginBottom: 2 }}
      descriptionStyle={{ fontSize: 12, opacity: 0.8 }}
      descriptionNumberOfLines={3}
      className="mb-3 rounded-2xl py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
      left={() => (
        <View className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 items-center justify-center mr-1">
          <View className="w-2 h-2 rounded-full bg-green-500" />
        </View>
      )}
      right={() => (
        <Appbar.Action
          icon="close"
          size={16}
          onPress={() => onRemove?.(id)}
          className="text-gray-300 dark:text-gray-600"
        />
      )}
    />
  );
};


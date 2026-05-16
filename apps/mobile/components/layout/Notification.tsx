import React from "react";
import { StyleSheet } from "react-native";
import { Appbar, List } from "@/components/ui";

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
      titleStyle={{ fontWeight: "bold" }}
      descriptionNumberOfLines={3}
      className="mb-2 rounded-lg py-2 bg-gray-100 dark:bg-dark-surface"
      right={(props: any) => (
        <Appbar.Action
          {...props}
          icon="close"
          size={20}
          onPress={() => onRemove?.(id)}
          className="text-gray-400 dark:text-gray-500"
        />
      )}
    />
  );
};

const styles = StyleSheet.create({});

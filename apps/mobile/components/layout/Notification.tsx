import React from "react";
import { StyleSheet } from "react-native";
import { Appbar, List, useTheme } from "react-native-paper";

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
  const theme = useTheme();

  return (
    <List.Item
      title={title}
      description={description}
      titleStyle={styles.title}
      descriptionNumberOfLines={3}
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level1 },
      ]}
      right={(props) => (
        <Appbar.Action
          {...props}
          icon="close"
          size={20}
          onPress={() => onRemove?.(id)}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 8,
  },
  title: {
    fontWeight: "bold",
  },
});

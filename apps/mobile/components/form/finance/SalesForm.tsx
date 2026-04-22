import { Icon } from "@/components/ui/Icon";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  IconButton,
  Menu,
} from "react-native-paper";
import axiosInstance from "@/lib/axiosInstance";

export type SalesFormData = {
  sales_name?: string;
  sales_date: string;
  occupation?: string;
  items_sold: string[];
  quantities_sold: number[];
  prices_per_unit: number[];
  quantity_unit?: string;
};

type SalesFormProps = {
  userId: string;
  initialData?: SalesFormData;
  onSubmit: (data: SalesFormData) => Promise<void>;
};

type SoldItem = {
  name: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
};

const SalesForm = ({ userId, onSubmit }: SalesFormProps) => {
  const theme = useTheme();
  const [salesName, setSalesName] = useState("");
  const [salesDate, setSalesDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [occupation, setOccupation] = useState("");
  const [items, setItems] = useState<SoldItem[]>([
    { name: "", quantity: "", unit: "", price_per_unit: "" },
  ]);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const user = response.data?.data?.user ?? response.data?.user;
        if (user && user.sub_type) {
          const fetchedSubTypes = Array.isArray(user.sub_type)
            ? user.sub_type
            : typeof user.sub_type === "string"
            ? user.sub_type.replace(/[{}"]/g, "").split(",").filter(Boolean)
            : [];
          setSubTypes(fetchedSubTypes);
        }
      } catch (error) {
        console.error("Error fetching user sub_types:", error);
      }
    };
    fetchUserSubTypes();
  }, [userId]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", quantity: "", unit: "", price_per_unit: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SoldItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const validateAndSubmit = () => {
    const data: SalesFormData = {
      sales_name: salesName || undefined,
      sales_date: salesDate,
      occupation: occupation || undefined,
      items_sold: items.map((i) => i.name),
      quantities_sold: items.map((i) => Number(i.quantity)),
      prices_per_unit: items.map((i) => Number(i.price_per_unit)),
      quantity_unit: items[0]?.unit || undefined,
    };
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Sales Title"
        mode="outlined"
        value={salesName}
        onChangeText={setSalesName}
        placeholder="e.g., Weekly Farm Stand Sales"
        style={styles.input}
      />
      <TextInput
        label="Sales Date (YYYY-MM-DD)"
        mode="outlined"
        value={salesDate}
        onChangeText={setSalesDate}
        style={styles.input}
        right={<TextInput.Icon icon="calendar" />}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.dropdownButton}
          >
            {occupation || "Select Occupation"}
          </Button>
        }
      >
        {subTypes.map((type) => (
          <Menu.Item
            key={type}
            onPress={() => {
              setOccupation(type);
              setMenuVisible(false);
            }}
            title={type}
          />
        ))}
      </Menu>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Items Sold
      </Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text variant="labelLarge">Item #{index + 1}</Text>
            {items.length > 1 && (
              <IconButton
                icon="close-circle"
                iconColor={theme.colors.error}
                onPress={() => handleRemoveItem(index)}
              />
            )}
          </View>
          <TextInput
            label="Item Name"
            mode="outlined"
            value={item.name}
            onChangeText={(v) => handleItemChange(index, "name", v)}
            style={styles.smallInput}
          />
          <View style={styles.row}>
            <TextInput
              label="Qty"
              mode="outlined"
              keyboardType="numeric"
              value={item.quantity}
              onChangeText={(v) => handleItemChange(index, "quantity", v)}
              style={[styles.smallInput, { flex: 1, marginRight: 8 }]}
            />
            <TextInput
              label="Unit"
              mode="outlined"
              value={item.unit}
              onChangeText={(v) => handleItemChange(index, "unit", v)}
              style={[styles.smallInput, { flex: 1, marginRight: 8 }]}
            />
            <TextInput
              label="Price/Unit"
              mode="outlined"
              keyboardType="numeric"
              value={item.price_per_unit}
              onChangeText={(v) => handleItemChange(index, "price_per_unit", v)}
              style={[styles.smallInput, { flex: 1.5 }]}
            />
          </View>
        </View>
      ))}

      <Button
        mode="text"
        onPress={handleAddItem}
        icon="plus"
        style={styles.addButton}
      >
        Add Another Item
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  input: { backgroundColor: "transparent" },
  dropdownButton: { marginTop: 8, borderRadius: 4 },
  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "bold" },
  itemContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  row: { flexDirection: "row" },
  smallInput: { backgroundColor: "transparent", marginBottom: 8 },
  addButton: { alignSelf: "flex-start" },
});

export default SalesForm;

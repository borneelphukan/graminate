import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  Menu,
  useTheme,
  Text,
} from "react-native-paper";
import axiosInstance from "@/lib/axiosInstance";

export type ExpenseFormData = {
  title: string;
  occupation?: string;
  category: string;
  expense: number;
  date_created: string;
};

type ExpenseFormProps = {
  userId: string;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
};

const EXPENSE_CATEGORIES = {
  "Goods & Services": ["Farm Utilities", "Agricultural Feeds", "Consulting"],
  "Utility Expenses": [
    "Electricity",
    "Labour Salary",
    "Water Supply",
    "Taxes",
    "Others",
  ],
};

const ExpenseForm = ({ userId, onSubmit }: ExpenseFormProps) => {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [dateCreated, setDateCreated] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [occupation, setOccupation] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [occMenuVisible, setOccMenuVisible] = useState(false);
  const [catMenuVisible, setCatMenuVisible] = useState(false);

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

  const handleSubmit = () => {
    const data: ExpenseFormData = {
      title,
      occupation: occupation || undefined,
      category,
      expense: Number(amount),
      date_created: dateCreated,
    };
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Expense Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Purchase of Animal Feed"
        style={styles.input}
      />
      
      <View style={styles.row}>
        <TextInput
          label="Date (YYYY-MM-DD)"
          mode="outlined"
          value={dateCreated}
          onChangeText={setDateCreated}
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          right={<TextInput.Icon icon="calendar" />}
        />
        <TextInput
          label="Amount (₹)"
          mode="outlined"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={[styles.input, { flex: 1 }]}
        />
      </View>

      <Menu
        visible={occMenuVisible}
        onDismiss={() => setOccMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setOccMenuVisible(true)}
            style={styles.dropdownButton}
          >
            {occupation || "Related Occupation"}
          </Button>
        }
      >
        {subTypes.map((type) => (
          <Menu.Item
            key={type}
            onPress={() => {
              setOccupation(type);
              setOccMenuVisible(false);
            }}
            title={type}
          />
        ))}
      </Menu>

      <Menu
        visible={catMenuVisible}
        onDismiss={() => setCatMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setCatMenuVisible(true)}
            style={styles.dropdownButton}
          >
            {category || "Expense Category"}
          </Button>
        }
      >
        {Object.entries(EXPENSE_CATEGORIES).map(([group, subCats]) => (
          <React.Fragment key={group}>
            <Menu.Item title={group} disabled titleStyle={{ fontWeight: 'bold' }} />
            {subCats.map((cat) => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setCatMenuVisible(false);
                }}
                title={cat}
                style={{ paddingLeft: 16 }}
              />
            ))}
          </React.Fragment>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  input: { backgroundColor: "transparent" },
  row: { flexDirection: "row" },
  dropdownButton: { marginTop: 8, borderRadius: 4 },
});

export default ExpenseForm;

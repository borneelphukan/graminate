import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  useTheme,
} from "react-native-paper";

export type LoanFormData = {
  loan_name: string;
  lender: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date?: string;
  status: string;
};

type LoanFormProps = {
  userId: string;
  onSubmit: (data: LoanFormData) => Promise<void>;
};

const LoanForm = ({ userId, onSubmit }: LoanFormProps) => {
  const [formData, setFormData] = useState({
    loan_name: "",
    lender: "",
    amount: "",
    interest_rate: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "Active",
  });

  const handleSubmit = () => {
    const data: LoanFormData = {
      ...formData,
      amount: parseFloat(formData.amount),
      interest_rate: parseFloat(formData.interest_rate),
      end_date: formData.end_date || undefined,
    };
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Loan Name"
        mode="outlined"
        value={formData.loan_name}
        onChangeText={(v) => setFormData({ ...formData, loan_name: v })}
        placeholder="e.g. Agricultural Expansion Loan"
        style={styles.input}
      />
      <TextInput
        label="Lender"
        mode="outlined"
        value={formData.lender}
        onChangeText={(v) => setFormData({ ...formData, lender: v })}
        placeholder="e.g. State Bank of India"
        style={styles.input}
      />
      
      <View style={styles.row}>
        <TextInput
          label="Amount (₹)"
          mode="outlined"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(v) => setFormData({ ...formData, amount: v })}
          style={[styles.input, { flex: 1, marginRight: 8 }]}
        />
        <TextInput
          label="Interest Rate (%)"
          mode="outlined"
          keyboardType="numeric"
          value={formData.interest_rate}
          onChangeText={(v) => setFormData({ ...formData, interest_rate: v })}
          style={[styles.input, { flex: 1 }]}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Start Date"
          mode="outlined"
          value={formData.start_date}
          onChangeText={(v) => setFormData({ ...formData, start_date: v })}
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          right={<TextInput.Icon icon="calendar" />}
        />
        <TextInput
          label="End Date (Optional)"
          mode="outlined"
          value={formData.end_date}
          onChangeText={(v) => setFormData({ ...formData, end_date: v })}
          style={[styles.input, { flex: 1 }]}
          right={<TextInput.Icon icon="calendar" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  input: { backgroundColor: "transparent" },
  row: { flexDirection: "row" },
});

export default LoanForm;

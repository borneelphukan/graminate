import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

// Using axiosInstance for all API calls

type ApiItem = { description: string; quantity: number; rate: number };
type Receipt = {
  invoice_id: number;
  title: string;
  receipt_number: string | null;
  bill_to: string;
  due_date: string;
  receipt_date: string;
  payment_terms: string | null;
  notes: string | null;
  tax: number;
  discount: number;
  shipping: number;
  items: ApiItem[];
};
type FormItem = { description: string; quantity: string; rate: string };
type Form = {
  title: string;
  receiptNumber: string;
  billTo: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
  tax: string;
  discount: string;
  shipping: string;
  items: FormItem[];
};

const initialFormState: Form = {
  title: "",
  receiptNumber: "",
  billTo: "",
  dueDate: "",
  paymentTerms: "",
  notes: "",
  tax: "0",
  discount: "0",
  shipping: "0",
  items: [{ description: "", quantity: "1", rate: "0" }],
};

const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const transformApiItemsToFormItems = (apiItems: ApiItem[]): FormItem[] => {
  if (!apiItems || apiItems.length === 0)
    return [{ description: "", quantity: "1", rate: "0" }];
  return apiItems.map((item) => ({
    description: item.description || "",
    quantity: String(item.quantity || 0),
    rate: String(item.rate || 0),
  }));
};

const ReceiptDetails = () => {
  const { user_id, data } = useLocalSearchParams<{
    user_id: string;
    data: string;
  }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [, setDeleting] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedReceipt: Receipt = JSON.parse(data);
        setReceipt(parsedReceipt);
        const formItems = transformApiItemsToFormItems(parsedReceipt.items);
        const newFormValues: Form = {
          title: parsedReceipt.title || "",
          receiptNumber: parsedReceipt.receipt_number || "",
          billTo: parsedReceipt.bill_to || "",
          dueDate: formatDateForInput(parsedReceipt.due_date),
          paymentTerms: parsedReceipt.payment_terms || "",
          notes: parsedReceipt.notes || "",
          tax: String(parsedReceipt.tax || 0),
          discount: String(parsedReceipt.discount || 0),
          shipping: String(parsedReceipt.shipping || 0),
          items: formItems,
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
      } catch {
        Alert.alert("Error", "Invalid receipt data.");
        router.back();
      }
    } else {
      Alert.alert("Error", "No receipt data.");
      router.back();
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleInputChange("items", newItems);
  };
  const addItem = () =>
    handleInputChange("items", [
      ...formData.items,
      { description: "", quantity: "1", rate: "0" },
    ]);
  const removeItem = (index: number) => {
    if (formData.items.length > 1)
      handleInputChange(
        "items",
        formData.items.filter((_, i) => i !== index)
      );
  };
  const hasChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  const { subtotal, total } = useMemo(() => {
    const sub = formData.items.reduce(
      (acc, item) =>
        acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0),
      0
    );
    const taxAmount = sub * (parseFloat(formData.tax) / 100 || 0);
    const discountAmount = parseFloat(formData.discount) || 0;
    const shippingAmount = parseFloat(formData.shipping) || 0;
    return {
      subtotal: sub,
      total: sub + taxAmount - discountAmount + shippingAmount,
    };
  }, [formData.items, formData.tax, formData.discount, formData.shipping]);

  const handleDayPress = (day: DateData) => {
    handleInputChange("dueDate", day.dateString);
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!receipt) return;
    setSaving(true);
    try {
      await AsyncStorage.getItem("accessToken");
      const payload = {
        invoice_id: receipt.invoice_id,
        title: formData.title,
        receipt_number: formData.receiptNumber || null,
        bill_to: formData.billTo,
        due_date: formData.dueDate || null,
        payment_terms: formData.paymentTerms || null,
        notes: formData.notes || null,
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
        shipping: parseFloat(formData.shipping) || 0,
        items: formData.items
          .map(({ description, quantity, rate }) => ({
            description,
            quantity: Number(quantity) || 0,
            rate: Number(rate) || 0,
          }))
          .filter(
            (item) => item.description.trim() !== "" && item.quantity > 0
          ),
      };
      await axiosInstance.put("/receipts/update", payload);
      Alert.alert("Success", "Receipt updated successfully.");
      router.replace(
        `/${user_id}/crm?view=receipts&refresh=${new Date().getTime()}`
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update receipt."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!receipt) return;
    Alert.alert(
      "Delete Receipt",
      `Are you sure you want to delete "${receipt.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await AsyncStorage.getItem("accessToken");
              await axiosInstance.delete(`/receipts/delete/${receipt.invoice_id}`);
              Alert.alert("Success", "Receipt deleted.");
              router.replace(
                `/${user_id}/crm?view=receipts&refresh=${new Date().getTime()}`
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to delete receipt."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!receipt) return;
    try {
      const message = `
Receipt: ${formData.title}
Billed To: ${formData.billTo}
Total Amount: ₹${total.toFixed(2)}
    `.trim();
      await Share.share({ message });
    } catch {
      Alert.alert("Error", "Failed to share receipt.");
    }
  };

  if (!receipt) {
    return (
      <PlatformLayout>
        <Appbar.Header className="bg-gray-900">
          <Appbar.Action
            icon={() => (
              <Icon
                type={"chevron-left" as any}
                size={22}
                className="text-light"
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Loading..." titleStyle={{ color: "white" }} />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Appbar.Header className="bg-gray-900">
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left" as any}
              size={22}
              className="text-light"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Receipt Details" titleStyle={{ color: "white" }} />
        <Menu
          visible={isMoreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => (
                <Icon
                  type={"dots-vertical" as any}
                  size={22}
                  className="text-light"
                />
              )}
              onPress={() => setMoreMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMoreMenuVisible(false);
              handleDelete();
            }}
            title="Delete Receipt"
            leadingIcon={() => (
              <Icon
                type={"delete" as any}
                size={20}
                className="text-red-600"
              />
            )}
            titleStyle={{ color: "#e53e3e" }}
          />
          <Menu.Item
            onPress={() => {
              setMoreMenuVisible(false);
              handleShare();
            }}
            title="Share Receipt"
            leadingIcon={() => (
              <Icon
                type={"share" as any}
                size={20}
                className="text-gray-400"
              />
            )}
          />
        </Menu>
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            mode="outlined"
            label="Invoice Title"
            value={formData.title}
            onChangeText={(val: string) => handleInputChange("title", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"receipt-long" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TextInput
            mode="outlined"
            label="Bill To"
            value={formData.billTo}
            onChangeText={(val: string) => handleInputChange("billTo", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"account" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TouchableRipple onPress={() => setDatePickerVisible(true)}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label="Due Date"
                value={formData.dueDate}
                editable={false}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"today" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"calendar-month" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
            </View>
          </TouchableRipple>
          <TextInput
            mode="outlined"
            label="Invoice Number (Optional)"
            value={formData.receiptNumber}
            onChangeText={(val: string) => handleInputChange("receiptNumber", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"tag" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TextInput
            mode="outlined"
            label="Payment Terms (Optional)"
            value={formData.paymentTerms}
            onChangeText={(val: string) => handleInputChange("paymentTerms", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"description" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <Text variant="titleMedium" className="mt-4 mb-2">
            Items
          </Text>
          {formData.items.map((item, index) => (
            <Card key={index} className="mb-3 border border-gray-200 dark:border-gray-800" mode="outlined">
              <Card.Title
                title={`Item #${index + 1}`}
                right={() =>
                  formData.items.length > 1 ? (
                    <IconButton
                      icon={() => (
                        <Icon
                          type={"delete" as any}
                          size={18}
                          className="text-red-600"
                        />
                      )}
                      onPress={() => removeItem(index)}
                    />
                  ) : null
                }
              />
              <Card.Content className="gap-3">
                <TextInput
                  mode="outlined"
                  label="Description"
                  value={item.description}
                  onChangeText={(text: string) =>
                    handleItemChange(index, "description", text)
                  }
                  left={
                    <TextInput.Icon
                      icon={() => (
                        <Icon
                          type={"edit" as any}
                          size={16}
                          className="text-gray-500"
                        />
                      )}
                    />
                  }
                />
                <View className="flex-row gap-4">
                  <TextInput
                    className="flex-1"
                    mode="outlined"
                    label="Quantity"
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(text: string) =>
                      handleItemChange(index, "quantity", text)
                    }
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            type={"inventory" as any}
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      />
                    }
                  />
                  <TextInput
                    className="flex-1"
                    mode="outlined"
                    label="Rate"
                    keyboardType="numeric"
                    value={item.rate}
                    onChangeText={(text: string) =>
                      handleItemChange(index, "rate", text)
                    }
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            type={"currency-rupee" as any}
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      />
                    }
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
          <Button
            icon={() => (
              <Icon
                type={"plus" as any}
                size={18}
                className="text-green-200"
              />
            )}
            mode="outlined"
            onPress={addItem}
            className="mt-2"
          >
            Add Item
          </Button>
          <View className="flex-row gap-4">
            <TextInput
              className="flex-1"
              mode="outlined"
              label="Tax %"
              keyboardType="numeric"
              value={formData.tax}
              onChangeText={(text: string) => handleInputChange("tax", text)}
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"percent" as any}
                      size={16}
                      className="text-gray-500"
                    />
                  )}
                />
              }
            />
            <TextInput
              className="flex-1"
              mode="outlined"
              label="Discount"
              keyboardType="numeric"
              value={formData.discount}
              onChangeText={(text: string) => handleInputChange("discount", text)}
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"sell" as any}
                      size={16}
                      className="text-gray-500"
                    />
                  )}
                />
              }
            />
            <TextInput
              className="flex-1"
              mode="outlined"
              label="Shipping"
              keyboardType="numeric"
              value={formData.shipping}
              onChangeText={(text: string) => handleInputChange("shipping", text)}
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"local-shipping" as any}
                      size={16}
                      className="text-gray-500"
                    />
                  )}
                />
              }
            />
          </View>
          <Card className="mt-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Card.Content>
              <View className="flex-row justify-between py-1">
                <Text variant="bodyLarge">Subtotal</Text>
                <Text variant="bodyLarge">₹{subtotal.toFixed(2)}</Text>
              </View>
              <Divider className="my-2" />
              <View className="flex-row justify-between py-1">
                <Text variant="titleMedium">Total</Text>
                <Text variant="titleMedium">₹{total.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
        <Appbar className="absolute bottom-0 left-0 right-0 flex-row justify-around p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <Button
            className="flex-1 mx-2"
            mode="outlined"
            onPress={() => router.back()}
            icon={() => (
              <Icon
                type={"close" as any}
                size={18}
                className="text-green-200"
              />
            )}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 mx-2"
            mode="contained"
            onPress={handleSave}
            disabled={!hasChanges || saving}
            loading={saving}
            icon={() => (
              <Icon
                type={"content-save" as any}
                size={18}
                className={!hasChanges || saving ? "text-gray-300" : "text-white"}
              />
            )}
          >
            Save
          </Button>
        </Appbar>
      </KeyboardAvoidingView>
      <Portal>
        <Modal
          visible={isDatePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
        >
          <View className="m-5 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
            <Calendar
              onDayPress={handleDayPress}
              markedDates={
                formData.dueDate
                  ? { [formData.dueDate]: { selected: true } }
                  : {}
              }
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#9ca3af",
                selectedDayBackgroundColor: "#2b7860",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#2b7860",
                dayTextColor: "#374151",
                textDisabledColor: "#d1d5db",
                arrowColor: "#2b7860",
                monthTextColor: "#111827",
              }}
            />
          </View>
        </Modal>
      </Portal>
    </PlatformLayout>
  );
};

export default ReceiptDetails;

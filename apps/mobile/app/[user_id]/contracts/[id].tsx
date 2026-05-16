import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { CONTRACT_STATUS, PRIORITY_OPTIONS } from "@/constants/options";
import axiosInstance from "@/lib/axiosInstance";
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
  Menu,
  Modal,
  Portal,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

// Using axiosInstance for all API calls

type Contract = {
  deal_id: number;
  deal_name: string;
  partner: string;
  amount: number;
  stage: string;
  start_date: string;
  end_date: string | null;
  category?: string | null;
  priority: string;
};
type Form = {
  dealName: string;
  partner: string;
  amount: string;
  stage: string;
  startDate: string;
  endDate: string;
  category: string;
  priority: string;
};
const initialFormState: Form = {
  dealName: "",
  partner: "",
  amount: "",
  stage: "",
  startDate: "",
  endDate: "",
  category: "",
  priority: "",
};

const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const ContractDetails = () => {
  const { user_id, data } = useLocalSearchParams<{
    user_id: string;
    data: string;
  }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [isStageMenuVisible, setStageMenuVisible] = useState(false);
  const [isPriorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState<
    "startDate" | "endDate" | null
  >(null);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedContract: Contract = JSON.parse(data);
        setContract(parsedContract);
        const newFormValues: Form = {
          dealName: parsedContract.deal_name || "",
          partner: parsedContract.partner || "",
          amount: parsedContract.amount?.toString() || "",
          stage: parsedContract.stage || "",
          startDate: formatDateForInput(parsedContract.start_date),
          endDate: formatDateForInput(parsedContract.end_date),
          category: parsedContract.category || "",
          priority: parsedContract.priority || "Medium",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
      } catch {
        Alert.alert("Error", "Invalid contract data.");
        router.back();
      }
    } else {
      Alert.alert("Error", "No contract data.");
      router.back();
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const hasChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  const showDatePicker = (field: "startDate" | "endDate") => {
    setDatePickerFor(field);
    setDatePickerVisible(true);
  };
  const handleDayPress = (day: DateData) => {
    if (datePickerFor) handleInputChange(datePickerFor, day.dateString);
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!contract) return;
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      Alert.alert(
        "Invalid Date",
        "End Date cannot be earlier than Start Date."
      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: contract.deal_id,
        deal_name: formData.dealName,
        partner: formData.partner,
        amount: parseFloat(formData.amount) || 0,
        stage: formData.stage,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        category: formData.category || null,
        priority: formData.priority,
      };
      await axiosInstance.put("/contracts/update", payload);
      Alert.alert("Success", "Contract updated successfully.");
      router.replace(
        `/${user_id}/crm?view=contracts&refresh=${new Date().getTime()}`
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update contract."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!contract) return;
    Alert.alert(
      "Delete Contract",
      `Are you sure you want to delete "${contract.deal_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/contracts/delete/${contract.deal_id}`);
              Alert.alert("Success", "Contract deleted successfully.");
              router.replace(
                `/${user_id}/crm?view=contracts&refresh=${new Date().getTime()}`
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to delete contract."
              );
            } finally {
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!contract) return;
    try {
      const message = `
Contract: ${formData.dealName}
Partner: ${formData.partner || "N/A"}
Amount: ₹${formData.amount || "0"}
Stage: ${formData.stage || "N/A"}
    `.trim();
      await Share.share({ message });
    } catch {
      Alert.alert("Error", "Failed to share contract.");
    }
  };

  if (!contract) {
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
        <Appbar.Content title={formData.dealName || "Contract Details"} titleStyle={{ color: "white" }} />
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
            title="Delete Contract"
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
            title="Share Contract"
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
            label="Contract Title"
            value={formData.dealName}
            onChangeText={(val: string) => handleInputChange("dealName", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"draw" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TextInput
            mode="outlined"
            label="Partner / Client"
            value={formData.partner}
            onChangeText={(val: string) => handleInputChange("partner", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"account-cog" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TextInput
            mode="outlined"
            label="Amount (₹)"
            value={formData.amount}
            onChangeText={(val: string) => handleInputChange("amount", val)}
            keyboardType="numeric"
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"currency-rupee" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <TextInput
            mode="outlined"
            label="Category"
            value={formData.category}
            onChangeText={(val: string) => handleInputChange("category", val)}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    type={"sell" as any}
                    size={18}
                    className="text-gray-500"
                  />
                )}
              />
            }
          />
          <View className="flex-row gap-4">
            <TouchableRipple
              onPress={() => showDatePicker("startDate")}
              className="flex-1"
            >
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  label="Start Date"
                  value={formData.startDate}
                  editable={false}
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
            <TouchableRipple
              onPress={() => showDatePicker("endDate")}
              className="flex-1"
            >
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  label="End Date (Optional)"
                  value={formData.endDate}
                  editable={false}
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
          </View>
          <Menu
            visible={isStageMenuVisible}
            onDismiss={() => setStageMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setStageMenuVisible(true)}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Stage"
                    value={formData.stage}
                    editable={false}
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            type={"show-chart" as any}
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
                            type={"chevron-down" as any}
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      />
                    }
                  />
                </View>
              </TouchableRipple>
            }
          >
            {CONTRACT_STATUS.map((stage) => (
              <Menu.Item
                key={stage}
                title={stage}
                onPress={() => {
                  handleInputChange("stage", stage);
                  setStageMenuVisible(false);
                }}
              />
            ))}
          </Menu>
          <Menu
            visible={isPriorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setPriorityMenuVisible(true)}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Priority"
                    value={formData.priority}
                    editable={false}
                    left={
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            type={"warning" as any}
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
                            type={"chevron-down" as any}
                            size={16}
                            className="text-gray-500"
                          />
                        )}
                      />
                    }
                  />
                </View>
              </TouchableRipple>
            }
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <Menu.Item
                key={priority}
                title={priority}
                onPress={() => {
                  handleInputChange("priority", priority);
                  setPriorityMenuVisible(false);
                }}
              />
            ))}
          </Menu>
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
                datePickerFor && formData[datePickerFor]
                  ? { [formData[datePickerFor]]: { selected: true } }
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

export default ContractDetails;

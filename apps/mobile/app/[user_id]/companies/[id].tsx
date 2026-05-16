import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { COMPANY_TYPES } from "@/constants/options";
import axiosInstance from "@/lib/axiosInstance";
import * as Linking from "expo-linking";
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
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

// Using axiosInstance for all API calls

type Company = {
  company_id: string;
  company_name: string;
  contact_person: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website?: string;
  industry?: string;
};
type Form = {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
  industry: string;
};
const initialFormState: Form = {
  companyName: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  type: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  website: "",
  industry: "",
};

const CompanyDetails = () => {
  const { user_id, data } = useLocalSearchParams<{
    user_id: string;
    data: string;
  }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [isTypeMenuVisible, setTypeMenuVisible] = useState(false);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedCompany: Company = JSON.parse(data);
        setCompany(parsedCompany);
        const newFormValues: Form = {
          companyName: parsedCompany.company_name || "",
          contactPerson: parsedCompany.contact_person || "",
          email: parsedCompany.email || "",
          phoneNumber: parsedCompany.phone_number || "",
          type: parsedCompany.type || "",
          addressLine1: parsedCompany.address_line_1 || "",
          addressLine2: parsedCompany.address_line_2 || "",
          city: parsedCompany.city || "",
          state: parsedCompany.state || "",
          postalCode: parsedCompany.postal_code || "",
          website: parsedCompany.website || "",
          industry: parsedCompany.industry || "",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
      } catch {
        Alert.alert("Error", "Invalid company data.");
        router.back();
      }
    } else {
      Alert.alert("Error", "No company data.");
      router.back();
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const hasChanges = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const payload = {
        id: company.company_id,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email || null,
        phone_number: formData.phoneNumber || null,
        type: formData.type || null,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2 || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        website: formData.website || null,
        industry: formData.industry || null,
      };
      await axiosInstance.put("/companies/update", payload);
      Alert.alert("Success", "Company updated.");
      router.replace(
        `/${user_id}/crm?view=companies&refresh=${new Date().getTime()}`
      );
    } catch {
      Alert.alert("Error", "Failed to update company.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!company) return;
    Alert.alert(
      "Delete Company",
      `Are you sure you want to delete ${company.company_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/companies/delete/${company.company_id}`);
              Alert.alert("Success", "Company deleted.");
              router.replace(
                `/${user_id}/crm?view=companies&refresh=${new Date().getTime()}`
              );
            } catch {
              Alert.alert("Error", "Failed to delete company.");
            } finally {
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!company) return;
    try {
      const message = `
Company: ${formData.companyName}
Contact: ${formData.contactPerson || "N/A"}
Phone: ${formData.phoneNumber || "N/A"}
Email: ${formData.email || "N/A"}
    `.trim();
      await Share.share({ message });
    } catch {
      Alert.alert("Error", "Failed to share company.");
    }
  };

  const handleActionPress = (
    type: "tel" | "mailto" | "web",
    value?: string
  ) => {
    if (!value) {
      Alert.alert("No Information", "This field has no value.");
      return;
    }
    const url =
      type === "web"
        ? value.startsWith("http")
          ? value
          : `https://${value}`
        : `${type}:${value}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open link.")
    );
  };

  if (!company)
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
          <Appbar.Content title="Company Details" titleStyle={{ color: "white" }} />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );

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
        <Appbar.Content title="Company Details" titleStyle={{ color: "white" }} />
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
            title="Delete Company"
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
            title="Share Company"
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
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center py-4 gap-2">
            <Text variant="headlineMedium" className="text-center">
              {formData.companyName}
            </Text>
            <Text
              variant="titleMedium"
              className="text-gray-500"
            >
              {formData.contactPerson}
            </Text>
          </View>
          <View className="flex-row justify-around flex-wrap py-2">
            <Button
              icon={() => (
                <Icon
                  type={"phone" as any}
                  size={18}
                  className={formData.phoneNumber ? "text-green-200" : "text-gray-300"}
                />
              )}
              onPress={() => handleActionPress("tel", formData.phoneNumber)}
              disabled={!formData.phoneNumber}
            >
              Call
            </Button>
            <Button
              icon={() => (
                <Icon
                  type={"email" as any}
                  size={18}
                  className={formData.email ? "text-green-200" : "text-gray-300"}
                />
              )}
              onPress={() => handleActionPress("mailto", formData.email)}
              disabled={!formData.email}
            >
              Email
            </Button>
            <Button
              icon={() => (
                <Icon
                  type={"web" as any}
                  size={18}
                  className={formData.website ? "text-green-200" : "text-gray-300"}
                />
              )}
              onPress={() => handleActionPress("web", formData.website)}
              disabled={!formData.website}
            >
              Website
            </Button>
          </View>
          <Card className="bg-light dark:bg-gray-800 border border-gray-400 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden my-2">
            <Card.Title title="Company Information" />
            <Card.Content className="gap-4">
              <TextInput
                mode="outlined"
                label="Company Name"
                value={formData.companyName}
                onChangeText={(val: string) => handleInputChange("companyName", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"domain" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Contact Person"
                value={formData.contactPerson}
                onChangeText={(val: string) => handleInputChange("contactPerson", val)}
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
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                onChangeText={(val: string) => handleInputChange("email", val)}
                keyboardType="email-address"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"email" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(val: string) => handleInputChange("phoneNumber", val)}
                keyboardType="phone-pad"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"phone" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Website"
                value={formData.website}
                onChangeText={(val: string) => handleInputChange("website", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"web" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Industry"
                value={formData.industry}
                onChangeText={(val: string) => handleInputChange("industry", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"factory" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <Menu
                visible={isTypeMenuVisible}
                onDismiss={() => setTypeMenuVisible(false)}
                anchor={
                  <TouchableRipple onPress={() => setTypeMenuVisible(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        mode="outlined"
                        label="Type"
                        value={formData.type}
                        editable={false}
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
                {COMPANY_TYPES.map((type) => (
                  <Menu.Item
                    key={type}
                    title={type}
                    onPress={() => {
                      handleInputChange("type", type);
                      setTypeMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>
            </Card.Content>
          </Card>
          <Card className="bg-light dark:bg-gray-800 border border-gray-400 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden my-2">
            <Card.Title title="Address" />
            <Card.Content className="gap-4">
              <TextInput
                mode="outlined"
                label="Address Line 1"
                value={formData.addressLine1}
                onChangeText={(val: string) => handleInputChange("addressLine1", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"map-marker" as any}
                        size={18}
                        className="text-gray-500"
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Address Line 2"
                value={formData.addressLine2}
                onChangeText={(val: string) => handleInputChange("addressLine2", val)}
              />
              <TextInput
                mode="outlined"
                label="City"
                value={formData.city}
                onChangeText={(val: string) => handleInputChange("city", val)}
              />
              <TextInput
                mode="outlined"
                label="State"
                value={formData.state}
                onChangeText={(val: string) => handleInputChange("state", val)}
              />
              <TextInput
                mode="outlined"
                label="Postal / Zip Code"
                value={formData.postalCode}
                onChangeText={(val: string) => handleInputChange("postalCode", val)}
                keyboardType="numeric"
              />
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
    </PlatformLayout>
  );
};

export default CompanyDetails;

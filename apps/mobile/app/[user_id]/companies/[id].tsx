import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { COMPANY_TYPES } from "@/constants/options";
import axiosInstance from "@/lib/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
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
  useTheme,
} from "react-native-paper";

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
  const theme = useTheme();
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
        <Appbar.Header>
          <Appbar.Action
            icon={() => (
              <Icon
                type={"arrow_back" as any}
                size={22}
                color={theme.colors.onSurface}
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Company Details" />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"arrow-left" as any}
              size={22}
              color={theme.colors.onSurface}
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Company Details" />
        <Menu
          visible={isMoreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => (
                <Icon
                  type={"dots-vertical" as any}
                  size={22}
                  color={theme.colors.onSurface}
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
                color={theme.colors.error}
              />
            )}
            titleStyle={{ color: theme.colors.error }}
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
                color={theme.colors.onSurfaceVariant}
              />
            )}
          />
        </Menu>
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.nameHeader}>
            <Text variant="headlineMedium" style={styles.textCenter}>
              {formData.companyName}
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {formData.contactPerson}
            </Text>
          </View>
          <View style={styles.actionsRow}>
            <Button
              icon={() => (
                <Icon
                  type={"phone" as any}
                  size={18}
                  color={
                    formData.phoneNumber
                      ? theme.colors.primary
                      : theme.colors.onSurfaceDisabled
                  }
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
                  color={
                    formData.email
                      ? theme.colors.primary
                      : theme.colors.onSurfaceDisabled
                  }
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
                  color={
                    formData.website
                      ? theme.colors.primary
                      : theme.colors.onSurfaceDisabled
                  }
                />
              )}
              onPress={() => handleActionPress("web", formData.website)}
              disabled={!formData.website}
            >
              Website
            </Button>
          </View>
          <Card style={styles.card}>
            <Card.Title title="Company Information" />
            <Card.Content style={styles.cardContent}>
              <TextInput
                mode="outlined"
                label="Company Name"
                value={formData.companyName}
                onChangeText={(val) => handleInputChange("companyName", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"domain" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Contact Person"
                value={formData.contactPerson}
                onChangeText={(val) => handleInputChange("contactPerson", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"account" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                onChangeText={(val) => handleInputChange("email", val)}
                keyboardType="email-address"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"email" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(val) => handleInputChange("phoneNumber", val)}
                keyboardType="phone-pad"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"phone" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Website"
                value={formData.website}
                onChangeText={(val) => handleInputChange("website", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"web" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Industry"
                value={formData.industry}
                onChangeText={(val) => handleInputChange("industry", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"factory" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
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
                                color={theme.colors.onSurfaceVariant}
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
          <Card style={styles.card}>
            <Card.Title title="Address" />
            <Card.Content style={styles.cardContent}>
              <TextInput
                mode="outlined"
                label="Address Line 1"
                value={formData.addressLine1}
                onChangeText={(val) => handleInputChange("addressLine1", val)}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"map-marker" as any}
                        size={18}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Address Line 2"
                value={formData.addressLine2}
                onChangeText={(val) => handleInputChange("addressLine2", val)}
              />
              <TextInput
                mode="outlined"
                label="City"
                value={formData.city}
                onChangeText={(val) => handleInputChange("city", val)}
              />
              <TextInput
                mode="outlined"
                label="State / Province"
                value={formData.state}
                onChangeText={(val) => handleInputChange("state", val)}
              />
              <TextInput
                mode="outlined"
                label="Postal / Zip Code"
                value={formData.postalCode}
                onChangeText={(val) => handleInputChange("postalCode", val)}
                keyboardType="numeric"
              />
            </Card.Content>
          </Card>
        </ScrollView>
        <Appbar style={styles.footer}>
          <Button
            style={styles.footerButton}
            mode="outlined"
            onPress={() => router.back()}
            icon={() => (
              <Icon
                type={"close" as any}
                size={18}
                color={theme.colors.primary}
              />
            )}
          >
            Cancel
          </Button>
          <Button
            style={styles.footerButton}
            mode="contained"
            onPress={handleSave}
            disabled={!hasChanges || saving}
            loading={saving}
            icon={() => (
              <Icon
                type={"content-save" as any}
                size={18}
                color={
                  !hasChanges || saving
                    ? theme.colors.onSurfaceDisabled
                    : theme.colors.onPrimary
                }
              />
            )}
          >
            Save Changes
          </Button>
        </Appbar>
      </KeyboardAvoidingView>
    </PlatformLayout>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16, gap: 24, paddingBottom: 80 },
  nameHeader: { alignItems: "center", paddingVertical: 16, gap: 8 },
  textCenter: { textAlign: "center" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    paddingVertical: 8,
  },
  card: {},
  cardContent: { gap: 16 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerButton: { flex: 1, marginHorizontal: 8 },
});

export default CompanyDetails;

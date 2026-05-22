import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { CONTACT_TYPES } from "@/constants/options";
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
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

type Contact = {
  contact_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  type?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};
type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};
const initialFormState: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  type: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

const ContactDetails = () => {
  const { user_id, data } = useLocalSearchParams<{
    user_id: string;
    data: string;
  }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Form>(initialFormState);
  const [initialFormData, setInitialFormData] =
    useState<Form>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [isTypeMenuVisible, setTypeMenuVisible] = useState(false);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  useEffect(() => {
    if (data) {
      try {
        const parsedContact: Contact = JSON.parse(data);
        setContact(parsedContact);
        const newFormValues: Form = {
          firstName: parsedContact.first_name || "",
          lastName: parsedContact.last_name || "",
          email: parsedContact.email || "",
          phoneNumber: parsedContact.phone_number || "",
          type: parsedContact.type || "",
          addressLine1: parsedContact.address_line_1 || "",
          addressLine2: parsedContact.address_line_2 || "",
          city: parsedContact.city || "",
          state: parsedContact.state || "",
          postalCode: parsedContact.postal_code || "",
        };
        setFormData(newFormValues);
        setInitialFormData(newFormValues);
      } catch {
        Alert.alert("Error", "Invalid contact data.");
        router.back();
      }
    } else {
      Alert.alert("Error", "No contact data.");
      router.back();
    }
  }, [data]);

  const handleInputChange = (field: keyof Form, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const hasChanges = useMemo(
    () =>
      JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );
  const initials = useMemo(() => {
    const f = formData.firstName ? formData.firstName.trim().charAt(0) : "";
    const l = formData.lastName ? formData.lastName.trim().charAt(0) : "";
    return `${f}${l}`.toUpperCase() || "?";
  }, [formData.firstName, formData.lastName]);

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);
    try {
      const payload = {
        id: contact.contact_id,
        first_name: formData.firstName,
        last_name: formData.lastName || null,
        email: formData.email || null,
        phone_number: formData.phoneNumber || null,
        type: formData.type || null,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2 || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
      };
      await axiosInstance.put("/contacts/update", payload);
      Alert.alert("Success", "Contact updated.");
      router.replace(
        `/${user_id}/crm?view=contacts&refresh=${new Date().getTime()}`
      );
    } catch {
      Alert.alert("Error", "Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!contact) return;
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${formData.firstName} ${formData.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("accessToken");
              await axiosInstance.delete(
                `/contacts/delete/${contact.contact_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert("Success", "Contact deleted.");
              router.replace(
                `/${user_id}/crm?view=contacts&refresh=${new Date().getTime()}`
              );
            } catch {
              Alert.alert("Error", "Failed to delete contact.");
            } finally {
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!contact) return;
    try {
      const message = `
Name: ${formData.firstName} ${formData.lastName}
Phone: ${formData.phoneNumber || "N/A"}
Email: ${formData.email || "N/A"}
    `.trim();
      await Share.share({ message });
    } catch {
      Alert.alert("Error", "Failed to share contact.");
    }
  };


  const handleCall = () => {
    if (formData.phoneNumber) Linking.openURL(`tel:${formData.phoneNumber}`);
    else Alert.alert("No Phone Number", "This contact has no phone number.");
  };
  const handleEmail = () => {
    if (formData.email) Linking.openURL(`mailto:${formData.email}`);
    else Alert.alert("No Email", "This contact has no email address.");
  };

  if (!contact)
    return (
      <PlatformLayout>
        <Appbar.Header>
          <Appbar.Action
            icon={() => (
              <Icon
                type={"chevron-left" as any}
                size={22}
                className="text-dark dark:text-light"
              />
            )}
            onPress={() => router.back()}
          />
          <Appbar.Content title="Contact Details" />
        </Appbar.Header>
        <View className="flex-1 justify-center items-center">
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
              type={"chevron-left" as any}
              size={22}
              className="text-dark dark:text-light"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Contact Details" />
        <Menu
          visible={isMoreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => (
                <Icon
                  type="dots-vertical"
                  size={22}
                  className="text-dark dark:text-light"
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
            title="Delete Contact"
            leadingIcon={() => (
              <Icon
                type="delete"
                size={20}
                className="text-red-200"
              />
            )}
            titleClassName="text-dark dark:text-light"
          />
          <Menu.Item
            onPress={() => {
              setMoreMenuVisible(false);
              handleShare();
            }}
            title="Share Contact"
            leadingIcon={() => (
              <Icon
                type="share"
                size={20}
                className="text-gray-400"
              />
            )}
            titleClassName="text-dark dark:text-light"
          />
        </Menu>
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center pt-4 pb-2">
            <Avatar.Text
              label={initials}
              size={80}
              className="bg-green-300 dark:bg-green-100 mb-4"
              labelClassName="text-green-100 dark:text-green-300 font-extrabold text-3xl"
            />
            <Text className="text-2xl font-bold">
              {`${formData.firstName} ${formData.lastName}`.trim()}
            </Text>
          </View>
          <View className="flex-row justify-around py-2">
            <Button
              mode="secondary"
              icon={() => (
                <Icon
                  type="phone"
                  size={18}
                  className={formData.phoneNumber ? "text-green-200" : "text-gray-300"}
                />
              )}
              onPress={handleCall}
              disabled={!formData.phoneNumber}
            />
            <Button
              mode="secondary"
              icon={() => (
                <Icon
                  type="email"
                  size={18}
                  className={formData.email ? "text-green-200" : "text-gray-300"}
                />
              )}
              onPress={handleEmail}
              disabled={!formData.email}
            />
          </View>
          <Card className="bg-light dark:bg-gray-800 border border-gray-400 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden my-2">
            <Card.Title title="Personal Information" />
            <Card.Content className="gap-4">
              <TextInput
                mode="outlined"
                label="First Name"
                value={formData.firstName}
                onChangeText={(val: string) => handleInputChange("firstName", val)}
              />
              <TextInput
                mode="outlined"
                label="Last Name"
                value={formData.lastName}
                onChangeText={(val: string) => handleInputChange("lastName", val)}
              />
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                onChangeText={(val: string) => handleInputChange("email", val)}
                keyboardType="email-address"
              />
              <TextInput
                mode="outlined"
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(val: string) => handleInputChange("phoneNumber", val)}
                keyboardType="phone-pad"
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
                {CONTACT_TYPES.map((type) => (
                  <Menu.Item
                    key={type.value}
                    title={type.label}
                    onPress={() => {
                      handleInputChange("type", type.value);
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
        <Appbar className="absolute bottom-0 left-0 right-0 flex-row justify-around p-2 bg-light dark:bg-dark border-t border-gray-200 dark:border-gray-800">
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

export default ContactDetails;

import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { LANGUAGES, TIME_FORMAT } from "@/constants/options";
import axiosInstance from "@/lib/axiosInstance";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  HelperText,
  Menu,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

type TimeFormatOption = "12-hour" | "24-hour";
type SupportedLanguage = "English" | "Hindi" | "Assamese";

const PaperFormDropdown = ({
  label,
  items,
  selectedValue,
  onSelect,
  disabled = false,
  className,
}: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className={className}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => !disabled && setVisible(true)}
            disabled={disabled}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={selectedValue}
                editable={false}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"chevron-down" as any}
                        size={16}
                        className="text-gray-400"
                      />
                    )}
                  />
                }
                disabled={disabled}
              />
            </View>
          </TouchableRipple>
        }
      >
        {items.map((item: string) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              onSelect(item);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
};

const GeneralSettingsScreen = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();



  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [user, setUser] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: "English" as SupportedLanguage,
    timeFormat: "24-hour" as TimeFormatOption,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (!user_id) {
      setIsLoadingPageData(false);
      return;
    }
    const fetchUserData = async () => {
      setIsLoadingPageData(true);
      try {
        const response = await axiosInstance.get(`/user/${user_id}`);
        const userData = response.data.user ?? response.data.data?.user;
        if (!userData) throw new Error("User data not found");
        setUser({
          profilePicture: userData.profile_picture || "",
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phoneNumber: userData.phone_number || "",
          language: (userData.language || "English") as SupportedLanguage,
          timeFormat: (userData.time_format || "24-hour") as TimeFormatOption,
          addressLine1: userData.address_line_1 || "",
          addressLine2: userData.address_line_2 || "",
          city: userData.city || "",
          state: userData.state || "",
          postalCode: userData.postal_code || "",
          country: userData.country || "",
        });
      } catch (error) {
        console.error("Error fetching user data for General page:", error);
      } finally {
        setIsLoadingPageData(false);
      }
    };
    fetchUserData();
  }, [user_id]);

  const handleSaveProfileChanges = async () => {
    if (!user_id) return;
    setIsSavingProfile(true);
    setProfileSuccessMessage("");
    setProfileErrorMessage("");
    try {
      await axiosInstance.put(`/user/${user_id}`, {
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        language: user.language,
        time_format: user.timeFormat,
        address_line_1: user.addressLine1,
        address_line_2: user.addressLine2,
        city: user.city,
        state: user.state,
        postal_code: user.postalCode,
        country: user.country,
      });
      setProfileSuccessMessage("Profile updated successfully!");
    } catch {
      setProfileErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoadingPageData) {
    return (
      <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left" as any}
              size={22}
              className="text-black dark:text-white"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Profile Settings"
        />
      </Appbar.Header>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left" as any}
              size={22}
              className="text-black dark:text-white"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content
          title="Profile Settings"
          subtitle="Update your personal details"
        />
      </Appbar.Header>
      <ScrollView contentContainerClassName="p-4 gap-6">
        <Card>
          <Card.Title title="Profile Details" />
          <Card.Content className="gap-4">
            <TextInput
              label="First Name"
              value={user.firstName}
              disabled
              mode="outlined"
            />
            <TextInput
              label="Last Name"
              value={user.lastName}
              disabled
              mode="outlined"
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter Phone Number"
              value={user.phoneNumber}
              onChangeText={(val: string) =>
                setUser((prev) => ({ ...prev, phoneNumber: val }))
              }
              mode="outlined"
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"phone-outline" as any}
                      size={18}
                      className="text-gray-400"
                    />
                  )}
                />
              }
            />
            <View className="flex-row gap-4">
              <PaperFormDropdown
                label="Language"
                items={LANGUAGES}
                selectedValue={user.language}
                onSelect={(val: any) =>
                  setUser((prev) => ({ ...prev, language: val }))
                }
                className="flex-1"
              />
              <PaperFormDropdown
                label="Time Format"
                items={TIME_FORMAT}
                selectedValue={user.timeFormat}
                onSelect={(val: any) =>
                  setUser((prev) => ({ ...prev, timeFormat: val }))
                }
                className="flex-1"
              />
            </View>
          </Card.Content>
        </Card>

        <Card>
          <Card.Title title="Address Details" />
          <Card.Content className="gap-4">
            <TextInput
              label="Address Line 1"
              placeholder="Enter Address Line 1"
              value={user.addressLine1}
              onChangeText={(val: string) =>
                setUser((prev) => ({ ...prev, addressLine1: val }))
              }
              mode="outlined"
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"map-marker-outline" as any}
                      size={18}
                      className="text-gray-400"
                    />
                  )}
                />
              }
            />
            <TextInput
              label="Address Line 2 (Optional)"
              placeholder="Enter Address Line 2"
              value={user.addressLine2}
              onChangeText={(val: string) =>
                setUser((prev) => ({ ...prev, addressLine2: val }))
              }
              mode="outlined"
            />
            <View className="flex-row gap-4">
              <TextInput
                label="City"
                placeholder="Enter City"
                value={user.city}
                onChangeText={(val: string) =>
                  setUser((prev) => ({ ...prev, city: val }))
                }
                className="flex-1 bg-transparent"
                mode="outlined"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"city-variant-outline" as any}
                        size={18}
                        className="text-gray-400"
                      />
                    )}
                  />
                }
              />
              <TextInput
                label="State"
                placeholder="Enter State"
                value={user.state}
                onChangeText={(val: string) =>
                  setUser((prev) => ({ ...prev, state: val }))
                }
                className="flex-1 bg-transparent"
                mode="outlined"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Icon
                        type={"map-outline" as any}
                        size={18}
                        className="text-gray-400"
                      />
                    )}
                  />
                }
              />
            </View>
            <TextInput
              label="Postal Code"
              placeholder="Enter Postal Code"
              value={user.postalCode}
              onChangeText={(val: string) =>
                setUser((prev) => ({ ...prev, postalCode: val }))
              }
              mode="outlined"
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"mailbox-outline" as any}
                      size={18}
                      className="text-gray-400"
                    />
                  )}
                />
              }
            />
            <TextInput
              label="Country"
              value={user.country}
              disabled
              mode="outlined"
              left={
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      type={"earth" as any}
                      size={18}
                      className="text-gray-400"
                    />
                  )}
                />
              }
            />
          </Card.Content>
        </Card>

        <View className="items-start">
          <Button
            mode="contained"
            onPress={handleSaveProfileChanges}
            loading={isSavingProfile}
            disabled={isSavingProfile}
            icon={() => (
              <Icon
                type={"content-save" as any}
                size={18}
                className="text-white"
              />
            )}
            className="py-1"
          >
            Save Changes
          </Button>
          <HelperText
            type="info"
            visible={!!profileSuccessMessage}
            style={{ color: "green" }}
          >
            {profileSuccessMessage}
          </HelperText>
          <HelperText type="error" visible={!!profileErrorMessage}>
            {profileErrorMessage}
          </HelperText>
        </View>
      </ScrollView>
    </PlatformLayout>
  );
};

export default GeneralSettingsScreen;

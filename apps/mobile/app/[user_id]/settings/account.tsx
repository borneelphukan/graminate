import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
} from "@/components/ui";

type ModalType = "confirmDelete" | "password" | "info" | null;
type PopupContent = {
  title: string;
  message: string;
  type: "success" | "error";
};

const AccountSettingsScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [popupContent, setPopupContent] = useState<PopupContent>({
    title: "Error",
    message: "An unknown error occurred.",
    type: "success",
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = (type: ModalType, infoContent?: PopupContent) => {
    setPassword("");
    setPasswordError(null);
    if (type === "info" && infoContent) setPopupContent(infoContent);
    setActiveModal(type);
  };

  const closeModal = async () => {
    const wasSuccess =
      popupContent.type === "success" &&
      popupContent.title === "Account Deleted";
    setActiveModal(null);
    setPopupContent({
      title: "Error",
      message: "An unknown error occurred.",
      type: "success",
    });
    if (wasSuccess) {
      await AsyncStorage.setItem("accountJustDeleted", "true");
      router.replace("/");
    }
  };

  const handleConfirmDeletion = () => {
    setActiveModal(null);
    setTimeout(() => openModal("password"), 50);
  };

  const handlePasswordVerification = async () => {
    if (!user_id || !password) {
      setPasswordError("Password is required.");
      return;
    }
    setIsVerifying(true);
    setPasswordError(null);
    try {
      const response = await axiosInstance.post(
        `/user/verify-password/${user_id}`,
        { password }
      );
      if (response.data.valid) {
        setActiveModal(null);
        await performAccountDeletion();
      } else {
        setPasswordError("The password you entered is incorrect.");
      }
    } catch {
      setPasswordError("Password verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const performAccountDeletion = async () => {
    if (!user_id) return;
    setIsDeleting(true);
    try {
      const deleteResponse = await axiosInstance.delete(
        `/user/delete/${user_id}`
      );
      if (deleteResponse.status === 200) {
        openModal("info", {
          title: "Account Deleted",
          message: "Your account has been successfully deleted.",
          type: "success",
        });
      } else {
        throw new Error("Deletion failed");
      }
    } catch {
      openModal("info", {
        title: "Error",
        message: "Failed to delete account. Please try again later.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "confirmDelete":
        return (
          <Dialog visible={true} onDismiss={() => setActiveModal(null)}>
            <Dialog.Title>Are you sure?</Dialog.Title>
            <Dialog.Content>
              <Text>
                This action cannot be undone. This will permanently delete your
                account and all associated data.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setActiveModal(null)}>Cancel</Button>
              <Button
                onPress={handleConfirmDeletion}
                className="text-red-600"
              >
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        );
      case "password":
        return (
          <Dialog
            visible={true}
            onDismiss={() => !isVerifying && setActiveModal(null)}
          >
            <Dialog.Title>Enter Password to Confirm</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(val: string) => {
                  setPassword(val);
                  setPasswordError(null);
                }}
                secureTextEntry
                disabled={isVerifying}
                mode="outlined"
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setActiveModal(null)}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                onPress={handlePasswordVerification}
                disabled={isVerifying || !password}
                loading={isVerifying}
              >
                Confirm
              </Button>
            </Dialog.Actions>
          </Dialog>
        );
      case "info":
        return (
          <Dialog visible={true} onDismiss={closeModal}>
            <Dialog.Icon
              icon={() => (
                <Icon
                  type={popupContent.type === "success"
                      ? "check-circle"
                      : "alert-circle"}
                  size={48}
                  className={
                    popupContent.type === "success"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />
              )}
            />
            <Dialog.Title>{popupContent.title}</Dialog.Title>
            <Dialog.Content>
              <Text>{popupContent.message}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={closeModal}>OK</Button>
            </Dialog.Actions>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Icon
              type={"chevron-left"}
              size={22}
              className="text-black dark:text-white"
            />
          )}
          onPress={() => router.back()}
        />
        <Appbar.Content title="Account Settings" />
      </Appbar.Header>
      <ScrollView
        className="flex-1 p-4 bg-white dark:bg-gray-900"
      >
        <Card>
          <Card.Content className="gap-4">
            <View>
              <Text className="">Delete Account</Text>
              <Text
                variant="bodyMedium"
                className="text-gray-500"
              >
                Once you delete your account, there is no going back. Please be
                certain.
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => openModal("confirmDelete")}
              disabled={!user_id || isDeleting}
              loading={isDeleting}
              className="self-start bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      <Portal>{renderModalContent()}</Portal>
    </PlatformLayout>
  );
};

export default AccountSettingsScreen;

import { Icon } from "@/components/ui/Icon";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Button,
  Divider,
  IconButton,
  Surface,
  Text,
} from "@/components/ui";
import { Notification, NotificationProps } from "./Notification";

type NotificationBarProps = {
  notifications: NotificationProps[];
  isOpen: boolean;
  closeNotificationBar: () => void;
  onClearAll: () => void;
  onRemove?: (id: number) => void;
  onSettings: () => void;
};

const screenWidth = Dimensions.get("window").width;
const barWidth = Math.min(screenWidth * 0.85, 350);

const NotificationBar = ({
  notifications,
  isOpen,
  closeNotificationBar,
  onClearAll,
  onRemove,
  onSettings,
}: NotificationBarProps) => {
  const { darkMode } = useUserPreferences();
  const slideAnim = useRef(new Animated.Value(barWidth)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: barWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      closeNotificationBar();
    });
  };

const styles = StyleSheet.create({});

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 bg-black/50">
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              width: barWidth,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <TouchableWithoutFeedback>
              <Surface className="flex-1 bg-white dark:bg-dark-surface elevation-lg">
                <SafeAreaView className="flex-1">
                  <View className="flex-row items-center justify-between px-4 py-2">
                    <Text variant="titleLarge">Notifications</Text>
                    <IconButton
                      icon={() => (
                        <Icon
                          type={"close" as any}
                          size={24}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      )}
                      onPress={handleClose}
                    />
                  </View>

                  <Divider />

                  <View className="flex-row justify-end items-center px-2">
                    <Button
                      onPress={onClearAll}
                      textColor="#ef4444"
                      icon={() => (
                        <Icon
                          type={"delete" as any}
                          size={18}
                          className="text-red-500"
                        />
                      )}
                    >
                      Clear All
                    </Button>
                    <IconButton
                      icon={() => (
                        <Icon
                          type={"cog" as any}
                          size={20}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      )}
                      onPress={onSettings}
                    />
                  </View>

                  <Divider />

                  {notifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-4">
                      <Text className="text-gray-400 dark:text-gray-600 text-center">
                        You don’t have any notifications
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={notifications}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <Notification {...item} onRemove={onRemove} darkMode={darkMode} />
                      )}
                      contentContainerClassName="p-4"
                    />
                  )}
                </SafeAreaView>
              </Surface>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NotificationBar;

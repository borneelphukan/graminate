import { Icon } from "@/components/ui/Icon";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
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
const barWidth = Math.min(screenWidth * 0.85, 360);

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
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
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

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 bg-black/40">
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
              <Surface className="flex-1 bg-white dark:bg-dark-surface elevation-none border-l border-gray-100 dark:border-gray-800">
                <SafeAreaView className="flex-1">
                  <View className="flex-row items-center justify-between px-6 py-5">
                    <Text className="font-black tracking-tighter">
                      Notifications
                    </Text>
                    <TouchableOpacity 
                      onPress={handleClose}
                      className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 items-center justify-center"
                    >
                      <Icon type="close" size={18} className="text-gray-400" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-between px-6 py-2">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {notifications.length} Unread
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Button
                        onPress={onClearAll}
                        compact
                        mode="text"
                        textColor="#ef4444"
                        labelStyle={{ fontSize: 12, fontWeight: 'bold' }}
                      >
                        Clear All
                      </Button>
                      <TouchableOpacity 
                        onPress={onSettings}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Icon type="cog" size={18} className="text-gray-400" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Divider className="mx-6 opacity-30" />

                  {notifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-10">
                      <View className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-800 items-center justify-center mb-4">
                        <Icon type="bell-off-outline" size={32} className="text-gray-300 dark:text-gray-700" />
                      </View>
                      <Text className="text-gray-500 dark:text-gray-400 text-center font-medium">
                        All caught up!
                      </Text>
                      <Text className="text-gray-400 dark:text-gray-600 text-center text-xs mt-1">
                        Your notifications will appear here
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
                      showsVerticalScrollIndicator={false}
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


import { Icon } from "@/components/ui/Icon";
import Sparkles from "@/assets/icon/Sparkles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  Appbar,
  Avatar,
  TouchableRipple,
  Text,
} from "@/components/ui";
import NotificationBar from "./NotificationBar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type User = {
  name: string;
  email: string;
  business?: string;
};

type NavbarProps = {
  toggleSidebar: () => void;
  toggleChat: () => void;
};

const Navbar = ({ toggleSidebar, toggleChat }: NavbarProps) => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const [user, setUser] = useState<User>({ name: "", email: "" });
  const [isNotificationBarOpen, setNotificationBarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/user/${user_id}/notifications`);
      if (response.data?.data) {
        setNotifications(
          response.data.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            _raw: n,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user_id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const dismissNotification = async (notificationId: number) => {
    try {
      await axiosInstance.delete(`/user/${user_id}/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    async function fetchUserDetails() {
      if (!user_id) return;
      try {
        const response = await axiosInstance.get(`/user/${user_id}`);
        const data = response.data?.data?.user;
        if (data) {
          setUser({
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            business: data.business_name,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
    fetchUserDetails();
  }, [user_id]);

  const navigateToSettings = () => {
    setNotificationBarOpen(false);
    setTimeout(() => {
      router.push(`/${user_id}/settings/settings`);
    }, 300);
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };





  return (
    <>
      <Appbar.Header
        className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 h-16"
        elevated={0}
      >
        <Appbar.Action
          icon={() => <Icon type="menu" size={24} className="text-dark dark:text-light" />}
          onPress={toggleSidebar}
        />
        
        <View className="flex-1 items-center">
        </View>

        <Appbar.Action
          icon={() => <Sparkles size={26} className="text-dark dark:text-light" />}
          onPress={toggleChat}
        />
        
        <View>
          <Appbar.Action
            icon={() => <Icon type="bell" size={22} className="text-dark dark:text-light" />}
            onPress={() => setNotificationBarOpen(true)}
          />
          {notifications.length > 0 && (
            <View className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full items-center justify-center border-2 border-white dark:border-dark-surface">
              <Text className="text-[8px] font-bold text-white">
                {notifications.length}
              </Text>
            </View>
          )}
        </View>

        <TouchableRipple
          onPress={navigateToSettings}
          className="mr-3 ml-1 rounded-full"
          borderless
        >
          {user.name ? (
            <Avatar.Text
              size={34}
              label={getInitials(user.name)}
              className="bg-green-50 dark:bg-green-900"
              labelStyle={{ color: "#2b7860", fontWeight: 'bold', fontSize: 14 }}
            />
          ) : (
            <Avatar.Icon
              size={34}
              icon="account"
              className="bg-gray-100 dark:bg-gray-800"
              color="#6B7280"
            />
          )}
        </TouchableRipple>
      </Appbar.Header>

      <NotificationBar
        isOpen={isNotificationBarOpen}
        closeNotificationBar={() => setNotificationBarOpen(false)}
        notifications={notifications}
        onRemove={dismissNotification}
        onClearAll={async () => {
          try {
            await axiosInstance.delete(`/user/${user_id}/notifications`);
            setNotifications([]);
          } catch (error) {
            console.error("Error clearing all notifications:", error);
          }
        }}
        onSettings={navigateToSettings}
      />
    </>
  );
};

export default Navbar;

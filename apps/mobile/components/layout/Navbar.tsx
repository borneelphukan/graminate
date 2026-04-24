import { Icon } from "@/components/ui/Icon";
import Sparkles from "@/assets/icon/Sparkles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  Badge,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
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

type Notification = {
  title: string;
  description: string;
};

type NavbarProps = {
  toggleSidebar: () => void;
  toggleChat: () => void;
};

const Navbar = ({ toggleSidebar, toggleChat }: NavbarProps) => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const theme = useTheme();

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

  // Colors from packages/ui/lib/main.css to match web navbar
  const navbarBg = "#111827"; // gray-800
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#1f2937"; // gray-700
  const badgeColor = "#e53e3e"; // red-200 from main.css (close to red-600)

  const memoizedBarsIcon = useCallback(
    () => <Icon type={"menu"} size={22} color={navbarIconColor} />,
    [navbarIconColor]
  );

  const memoizedSparklesIcon = useCallback(
    () => <Sparkles size={38} color={navbarIconColor} />,
    [navbarIconColor]
  );

  const memoizedBellIcon = useCallback(
    () => <Icon type={"bell"} size={22} color={navbarIconColor} />,
    [navbarIconColor]
  );

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: navbarBg,
          borderBottomWidth: 1,
          borderBottomColor: navbarBorder,
        }}
      >
        <Appbar.Action
          icon={memoizedBarsIcon}
          onPress={toggleSidebar}
        />
        <View style={styles.spacer} />
        <Appbar.Action
          icon={memoizedSparklesIcon}
          onPress={toggleChat}
        />
        <View>
          <Appbar.Action
            icon={memoizedBellIcon}
            onPress={() => setNotificationBarOpen(true)}
          />
          <Badge
            visible={notifications.length > 0}
            style={[styles.badge, { backgroundColor: badgeColor }]}
            size={16}
          >
            {notifications.length}
          </Badge>
        </View>
        <TouchableRipple
          onPress={navigateToSettings}
          style={styles.avatarTouchable}
          borderless
        >
          {user.name ? (
            <Avatar.Text
              size={32}
              label={getInitials(user.name)}
              style={{ backgroundColor: theme.colors.primary }}
              labelStyle={{ color: "white" }}
            />
          ) : (
            <Avatar.Icon
              size={32}
              icon="account"
              style={{ backgroundColor: theme.colors.primary }}
              color="white"
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

const styles = StyleSheet.create({
  spacer: {
    flex: 1,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  avatarTouchable: {
    marginRight: 8,
    marginLeft: 4,
    borderRadius: 16,
  },
});

export default Navbar;

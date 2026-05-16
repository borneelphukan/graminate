import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>("/login");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const userStr = await AsyncStorage.getItem("user");
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          if (user && user.user_id) {
            setInitialRoute(`/${user.user_id}`);
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-dark">
        <ActivityIndicator size="large" className="text-green-100 dark:text-green-200" />
      </View>
    );
  }

  return <Redirect href={initialRoute as any} />;
}

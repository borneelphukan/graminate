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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <Redirect href={initialRoute as any} />;
}

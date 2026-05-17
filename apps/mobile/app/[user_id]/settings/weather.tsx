import PlatformLayout from "@/components/layout/PlatformLayout";
import {
  TemperatureScaleOption,
  useUserPreferences,
} from "@/contexts/UserPreferencesContext";
import axiosInstance from "@/lib/axiosInstance";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  HelperText,
  Menu,
  TextInput,
  TouchableRipple,
} from "@/components/ui";

const PaperFormDropdown = ({
  label,
  items,
  selectedValue,
  onSelect,
  disabled = false,
}: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <TouchableRipple
          onPress={() => !disabled && setVisible(true)}
          disabled={disabled}
        >
          <TextInput
            mode="outlined"
            label={label}
            value={selectedValue}
            editable={false}
            pointerEvents="none"
            right={<TextInput.Icon icon="menu-down" />}
            disabled={disabled}
          />
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
  );
};

const WeatherSettingsScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const {
    temperatureScale: contextTemperatureScale,
    setTemperatureScale: setContextTemperatureScale,
  } = useUserPreferences();

  const [isLoading, setIsLoading] = useState(true);
  const [weatherSettings, setWeatherSettings] = useState<{
    location: string;
    scale: TemperatureScaleOption;
  }>({
    location: "",
    scale: "Celsius",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user_id) {
      setIsLoading(false);
      setWeatherSettings((prev) => ({
        ...prev,
        scale: contextTemperatureScale || "Celsius",
      }));
      return;
    }
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/user/${user_id}`);
        const userData = response.data?.data?.user;
        if (userData) {
          const fetchedScale = (userData.temperature_scale ||
            contextTemperatureScale ||
            "Celsius") as TemperatureScaleOption;
          setWeatherSettings({
            location: userData.weather_location || "",
            scale: fetchedScale,
          });
          if (userData.temperature_scale)
            setContextTemperatureScale(fetchedScale);
          else if (contextTemperatureScale)
            setWeatherSettings((prev) => ({
              ...prev,
              scale: contextTemperatureScale,
            }));
        } else {
          setWeatherSettings((prev) => ({
            ...prev,
            scale: contextTemperatureScale || "Celsius",
          }));
        }
      } catch (error) {
        console.error("Error fetching weather settings:", error);
        setWeatherSettings((prev) => ({
          ...prev,
          scale: contextTemperatureScale || "Celsius",
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeatherData();
  }, [user_id, contextTemperatureScale, setContextTemperatureScale]);

  const handleSaveChanges = async () => {
    if (!user_id) return;
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      await axiosInstance.put(`/user/${user_id}`, {
        temperature_scale: weatherSettings.scale,
        weather_location: weatherSettings.location,
      });
      setContextTemperatureScale(weatherSettings.scale);
      setSuccessMessage("Weather settings updated successfully!");
    } catch {
      setErrorMessage("Failed to update weather settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PlatformLayout>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Weather Settings"
          subtitle="Customize preferences and location"
        />
      </Appbar.Header>
      <ScrollView contentContainerClassName="p-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View className="gap-4 max-w-[500px]">
            <TextInput
              mode="outlined"
              label="Set Your Location"
              placeholder="Enter city or zip code"
              value={weatherSettings.location}
              onChangeText={(val: string) =>
                setWeatherSettings((prev) => ({ ...prev, location: val }))
              }
            />
            <PaperFormDropdown
              label="Temperature Scale"
              items={["Celsius", "Fahrenheit"]}
              selectedValue={weatherSettings.scale}
              onSelect={(val: any) =>
                setWeatherSettings((prev) => ({ ...prev, scale: val }))
              }
            />
            <View className="mt-4">
              <Button
                mode="contained"
                onPress={handleSaveChanges}
                loading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
              <HelperText
                type="info"
                visible={!!successMessage}
                className="text-green-200"
              >
                {successMessage}
              </HelperText>
              <HelperText type="error" visible={!!errorMessage}>
                {errorMessage}
              </HelperText>
            </View>
          </View>
        )}
      </ScrollView>
    </PlatformLayout>
  );
};

export default WeatherSettingsScreen;

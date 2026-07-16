import React, { useState, useEffect, useCallback } from "react";
import { Alert, SafeAreaView, ScrollView, View, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, Button, TextInput, Appbar, ActivityIndicator, Surface } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";

type CardDetails = {
  bank_id: number;
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  card_type: string | null;
};

const formatCardNumberDisplay = (value: string) => {
  const raw = value.replace(/\D/g, "").substring(0, 16);
  const groups = raw.match(/.{1,4}/g);
  return groups ? groups.join(" ") : raw;
};

const MarketplaceSettings = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingDetails, setExistingDetails] = useState<CardDetails | null>(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardType, setCardType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCardDetails = useCallback(async () => {
    if (!user_id) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/marketplace/bank/${user_id}`);
      const data = res.data?.data;
      if (data) {
        setExistingDetails(data);
        setCardholderName(data.cardholder_name);
        setCardNumber(formatCardNumberDisplay(data.card_number));
        setExpiryDate(data.expiry_date);
        setCardType(data.card_type || "");
      }
    } catch {
      setExistingDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [user_id]);

  useEffect(() => { fetchCardDetails(); }, [fetchCardDetails]);

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumberDisplay(text);
    setCardNumber(formatted);
    const firstDigit = formatted.charAt(0);
    if (firstDigit === "4") setCardType("Visa");
    else if (firstDigit === "5") setCardType("Mastercard");
    else if (firstDigit === "3") setCardType("American Express");
    else if (firstDigit === "6") setCardType("Rupay");
    else setCardType("");
  };

  const handleExpiryChange = (text: string) => {
    let val = text.replace(/\D/g, "");
    if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    setExpiryDate(val.substring(0, 5));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const rawNumber = cardNumber.replace(/\s/g, "");
    if (!cardholderName.trim()) e.cardholderName = "Cardholder name is required.";
    if (rawNumber.length < 13 || rawNumber.length > 19) e.cardNumber = "Invalid card number length.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) e.expiryDate = "Expiry must be MM/YY format.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user_id) return;
    setIsSaving(true);
    try {
      await axiosInstance.post("/marketplace/bank/save", {
        user_id: Number(user_id),
        cardholder_name: cardholderName.trim(),
        card_number: cardNumber.replace(/\s/g, ""),
        expiry_date: expiryDate.trim(),
        card_type: cardType.trim() || "Generic",
      });
      Alert.alert("Success", "Card details updated successfully.");
      setIsEditing(false);
      fetchCardDetails();
    } catch {
      Alert.alert("Error", "Failed to update payment details.");
    } finally {
      setIsSaving(false);
    }
  };

  const maskCardNumber = (num: string) => {
    const clean = num.replace(/\s/g, "");
    if (clean.length < 4) return clean;
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  const showForm = !existingDetails || isEditing;

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Marketplace Payment" />
        </Appbar.Header>
        <ScrollView className="flex-1 p-4">
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" />
            </View>
          ) : showForm ? (
            <Surface className="rounded-xl p-6 bg-white dark:bg-dark-surface border border-gray-400 dark:border-gray-800">
              <View className="flex-row items-center gap-2 mb-6">
                <Icon type="credit-card" size={20} className="text-blue-500" />
                <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">Card Details</Text>
              </View>

              <TextInput
                mode="outlined"
                label="Cardholder Name"
                placeholder="e.g. JOHN DOE"
                value={cardholderName}
                onChangeText={(t: string) => setCardholderName(t.toUpperCase())}
                error={!!errors.cardholderName}
                className="mb-4"
              />
              {errors.cardholderName && <Text className="text-red-500 text-xs -mt-3 mb-2">{errors.cardholderName}</Text>}

              <View className="relative mb-4">
                <TextInput
                  mode="outlined"
                  label="Card Number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  error={!!errors.cardNumber}
                />
                {errors.cardNumber && <Text className="text-red-500 text-xs mt-1">{errors.cardNumber}</Text>}
                {cardType ? (
                  <View className="absolute top-7 right-3 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    <Text className="text-xs font-bold text-gray-500 uppercase">{cardType}</Text>
                  </View>
                ) : null}
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <TextInput
                    mode="outlined"
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    error={!!errors.expiryDate}
                  />
                  {errors.expiryDate && <Text className="text-red-500 text-xs mt-1">{errors.expiryDate}</Text>}
                </View>
                <View className="flex-1">
                  <TextInput
                    mode="outlined"
                    label="CVV (Not Stored)"
                    placeholder="•••"
                    value="***"
                    editable={false}
                    className="opacity-60"
                  />
                </View>
              </View>

              <View className="flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-400 dark:border-gray-800">
                {isEditing && (
                  <Button mode="outlined" onPress={() => { setIsEditing(false); if (existingDetails) { setCardholderName(existingDetails.cardholder_name); setCardNumber(formatCardNumberDisplay(existingDetails.card_number)); setExpiryDate(existingDetails.expiry_date); setCardType(existingDetails.card_type || ""); } setErrors({}); }}>
                    Cancel
                  </Button>
                )}
                <Button mode="contained" onPress={handleSave} loading={isSaving} disabled={isSaving}>
                  {isSaving ? "Saving..." : existingDetails ? "Update Card" : "Save Card"}
                </Button>
              </View>
            </Surface>
          ) : existingDetails && (
            <Surface className="rounded-xl p-6 bg-white dark:bg-dark-surface border border-gray-400 dark:border-gray-800">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-2">
                  <Icon type="credit-card" size={20} className="text-blue-500" />
                  <Text className="text-sm font-bold uppercase tracking-wider text-gray-500">Saved Card Payment</Text>
                </View>
                <Button mode="outlined" onPress={() => setIsEditing(true)} icon="pencil">Edit</Button>
              </View>

              <View className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-xl">
                <View className="items-end mb-4">
                  <Text className="text-white/50 text-2xl font-bold italic">
                    {existingDetails.card_type === "Generic" ? "Card" : existingDetails.card_type}
                  </Text>
                </View>
                <Text className="text-white text-xl font-mono tracking-widest mb-6">
                  {maskCardNumber(existingDetails.card_number)}
                </Text>
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-white/70 text-xs uppercase mb-0.5">Cardholder</Text>
                    <Text className="text-white font-medium tracking-wider uppercase">{existingDetails.cardholder_name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white/70 text-xs uppercase mb-0.5">Expires</Text>
                    <Text className="text-white font-mono">{existingDetails.expiry_date}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mt-6 pt-4 border-t border-gray-400 dark:border-gray-800">
                <Icon type="shield-check" size={16} className="text-gray-400" />
                <Text className="text-xs text-gray-500">Your information is stored for demonstration processing only.</Text>
              </View>
            </Surface>
          )}
        </ScrollView>
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default MarketplaceSettings;

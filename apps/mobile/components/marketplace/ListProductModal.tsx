import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Portal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, Button, TextInput, SegmentedButtons, ActivityIndicator, Appbar, Surface } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import * as ImagePicker from "expo-image-picker";
import axiosInstance from "@/lib/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { UNITS } from "@/constants/options";

type InventoryItem = {
  inventory_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  price_per_unit: number;
};

type ListProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string | undefined;
  onProductAdded: () => void;
  productToEdit?: {
    product_id: number;
    name: string;
    description: string | null;
    category: string;
    price: number;
    units: string;
    quantity: number;
    inventory_id?: number | null;
    images?: string[];
  };
};

const dataURLtoBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const ListProductModal = ({
  isOpen,
  onClose,
  userId,
  onProductAdded,
  productToEdit,
}: ListProductModalProps) => {
  const { subTypes } = useUserPreferences();
  const [source, setSource] = useState<"inventory" | "manual">("manual");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [units, setUnits] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const [unitSuggestions, setUnitSuggestions] = useState<string[]>(UNITS);

  useEffect(() => {
    if (isOpen && userId) {
      if (productToEdit) {
        setName(productToEdit.name);
        setDescription(productToEdit.description || "");
        setCategory(productToEdit.category);
        setPrice(String(productToEdit.price));
        setUnits(productToEdit.units);
        setQuantity(String(productToEdit.quantity));
        setSelectedInventoryId(productToEdit.inventory_id || null);
        setSource(productToEdit.inventory_id ? "inventory" : "manual");
        setImages(productToEdit.images || []);
      } else {
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setUnits("");
        setQuantity("1");
        setSelectedInventoryId(null);
        setSource("manual");
        setImages([]);
      }
      setErrors({});

      const fetchInventory = async () => {
        setIsLoadingInventory(true);
        try {
          const response = await axiosInstance.get(`/inventory/${userId}`);
          setInventoryItems(response.data.items || []);
        } catch {
          setInventoryItems([]);
        } finally {
          setIsLoadingInventory(false);
        }
      };
      fetchInventory();
    }
  }, [isOpen, userId, productToEdit]);

  useEffect(() => {
    if (selectedInventoryId && source === "inventory") {
      const item = inventoryItems.find((i) => i.inventory_id === selectedInventoryId);
      if (item) {
        setName(item.item_name);
        setUnits(item.units);
        setPrice(String(item.price_per_unit));
        setQuantity(String(item.quantity));
      }
    }
  }, [selectedInventoryId, source, inventoryItems]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Price must be greater than 0.";
    if (!units.trim()) newErrors.units = "Units are required.";
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = "Quantity must be at least 1.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!userId) return;
    setIsLoading(true);
    try {
      const base64Images = await Promise.all(
        images.map((uri) => {
          if (uri.startsWith("data:")) return Promise.resolve(uri);
          return dataURLtoBase64(uri);
        })
      );

      if (productToEdit) {
        await axiosInstance.put(`/marketplace/products/update/${productToEdit.product_id}`, {
          name: name.trim(),
          description: description.trim() || null,
          category,
          price: Number(price),
          units: units.trim(),
          quantity: Number(quantity),
          images: base64Images,
        });
        Alert.alert("Success", "Product listing updated successfully.");
      } else {
        await axiosInstance.post("/marketplace/products/add", {
          user_id: Number(userId),
          inventory_id: source === "inventory" ? selectedInventoryId : undefined,
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          price: Number(price),
          units: units.trim(),
          quantity: Number(quantity),
          images: base64Images,
        });
        Alert.alert("Success", "Product draft created. Click 'Publish' to make it live.");
      }
      onProductAdded();
    } catch {
      Alert.alert("Error", `Failed to ${productToEdit ? "update" : "create"} product listing.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={isOpen}
        onDismiss={onClose}
        containerClassName="m-0 justify-end"
        className="w-full p-0"
      >
        <Surface className="rounded-t-3xl overflow-hidden bg-white dark:bg-dark-surface max-h-[90%]" elevation={0}>
          <Appbar.Header className="border-b border-gray-400 dark:border-gray-800">
            <Appbar.Content title={productToEdit ? "Edit Product Listing" : "List New Product"} />
            <Appbar.Action icon="close" onPress={onClose} />
          </Appbar.Header>

          <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
            {!productToEdit && (
              <SegmentedButtons
                value={source}
                onValueChange={(val: string) => {
                  setSource(val as "inventory" | "manual");
                  setSelectedInventoryId(null);
                  if (val === "manual") { setName(""); setPrice(""); setUnits(""); setQuantity("1"); }
                }}
                buttons={[
                  { value: "manual", label: "Manual Entry" },
                  { value: "inventory", label: "From Inventory" },
                ]}
              />
            )}

            {!productToEdit && source === "inventory" && (
              <View className="mb-4">
                {isLoadingInventory ? (
                  <ActivityIndicator className="py-4" />
                ) : inventoryItems.length === 0 ? (
                  <Text className="text-sm text-gray-500 py-4">No inventory items found. Use manual entry instead.</Text>
                ) : (
                  <View className="gap-2 mt-2">
                    {inventoryItems.map((item) => (
                      <TouchableOpacity
                        key={item.inventory_id}
                        onPress={() => setSelectedInventoryId(item.inventory_id)}
                        className={`p-3 rounded-xl border ${
                          selectedInventoryId === item.inventory_id
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-400 dark:border-gray-800"
                        }`}
                      >
                        <Text className="font-semibold text-dark dark:text-light">{item.item_name}</Text>
                        <Text className="text-xs text-gray-500">{item.quantity} {item.units} · ₹{item.price_per_unit}/{item.units}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="gap-4">
              <TextInput
                mode="outlined"
                label="Product Name"
                placeholder="e.g., Organic Honey"
                value={name}
                onChangeText={setName}
                error={!!errors.name}
                disabled={source === "inventory" && !!selectedInventoryId}
              />
              {errors.name && <Text className="text-red-500 text-xs -mt-2">{errors.name}</Text>}

              <View className="z-10">
                <TextInput
                  mode="outlined"
                  label="Category"
                  placeholder="Select a category"
                  value={category}
                  onChangeText={setCategory}
                  onFocus={() => setShowUnitSuggestions(false)}
                  error={!!errors.category}
                />
                {subTypes.length > 0 && category.length > 0 && (
                  <Surface className="absolute top-[52px] left-0 right-0 z-20 rounded-lg overflow-hidden bg-white dark:bg-dark-surface" elevation={3}>
                    {subTypes
                      .filter((s) => s.toLowerCase().includes(category.toLowerCase()))
                      .slice(0, 5)
                      .map((s) => (
                        <TouchableOpacity key={s} onPress={() => { setCategory(s); }} className="px-3 py-2">
                          <Text className="text-sm text-dark dark:text-light">{s}</Text>
                        </TouchableOpacity>
                      ))}
                  </Surface>
                )}
                {errors.category && <Text className="text-red-500 text-xs">{errors.category}</Text>}
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <TextInput
                    mode="outlined"
                    label="Price (₹)"
                    placeholder="e.g., 250.00"
                    value={price}
                    onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ""))}
                    keyboardType="numeric"
                    error={!!errors.price}
                  />
                  {errors.price && <Text className="text-red-500 text-xs">{errors.price}</Text>}
                </View>
                <View className="flex-1">
                  <TextInput
                    mode="outlined"
                    label="Quantity"
                    placeholder="e.g., 10"
                    value={quantity}
                    onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    error={!!errors.quantity}
                  />
                  {errors.quantity && <Text className="text-red-500 text-xs">{errors.quantity}</Text>}
                </View>
              </View>

              <View className="relative z-20">
                <TextInput
                  mode="outlined"
                  label="Unit"
                  placeholder="e.g., kg"
                  value={units}
                  onChangeText={(t) => {
                    setUnits(t);
                    setUnitSuggestions(UNITS.filter((u) => u.toLowerCase().includes(t.toLowerCase())));
                    setShowUnitSuggestions(true);
                  }}
                  onFocus={() => { setUnitSuggestions(UNITS); setShowUnitSuggestions(true); }}
                  error={!!errors.units}
                  disabled={source === "inventory" && !!selectedInventoryId}
                />
                {showUnitSuggestions && unitSuggestions.length > 0 && (
                  <Surface className="absolute top-[52px] left-0 right-0 z-30 rounded-lg overflow-hidden bg-white dark:bg-dark-surface" elevation={3}>
                    {unitSuggestions.map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => { setUnits(s); setShowUnitSuggestions(false); }}
                        className="px-3 py-2"
                      >
                        <Text className="text-sm text-dark dark:text-light">{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </Surface>
                )}
                {errors.units && <Text className="text-red-500 text-xs">{errors.units}</Text>}
              </View>

              <View>
                <Text className="text-sm font-medium text-dark dark:text-light mb-2">Product Images</Text>
                <View className="flex-row flex-wrap gap-2">
                  {images.map((uri, i) => (
                    <View key={i} className="relative">
                      <Image source={{ uri }} className="w-20 h-20 rounded-lg" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                      >
                        <Icon type="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={pickImages}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 items-center justify-center"
                  >
                    <Icon type="camera" size={24} className="text-gray-400" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-dark dark:text-light mb-1">Description</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Describe your product..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </ScrollView>

          <View className={`p-4 border-t border-gray-400 dark:border-gray-800 ${Platform.OS === "ios" ? "pb-8" : "pb-4"}`}>
            <View className="flex-row gap-3">
              <Button mode="outlined" onPress={onClose} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSubmit} loading={isLoading} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : productToEdit ? "Save Changes" : "Create Draft"}
              </Button>
            </View>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

export default ListProductModal;

import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, Button, Appbar, IconButton } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import axiosInstance from "@/lib/axiosInstance";

type ProductDetailViewProps = {
  onBack: () => void;
  userId: number | string | undefined;
  product: {
    product_id: number;
    name: string;
    description: string | null;
    category: string;
    price: number;
    units: string;
    quantity: number;
    images: string[];
    users?: {
      first_name: string;
      last_name: string;
      business_name: string | null;
      city?: string | null;
      state?: string | null;
    };
  };
  onCartUpdate?: () => void;
  isProducer?: boolean;
  onBuy?: () => void;
};

const ProductDetailView = ({
  onBack,
  userId,
  product,
  onCartUpdate,
  isProducer = false,
  onBuy,
}: ProductDetailViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const sellerName = product.users
    ? product.users.business_name && product.users.business_name !== "Individual Account"
      ? product.users.business_name
      : `${product.users.first_name} ${product.users.last_name}`
    : "Unknown Seller";

  const sellerLocation =
    product.users && product.users.city
      ? `${product.users.city}${product.users.state ? `, ${product.users.state}` : ""}`
      : null;

  const handleAddToCart = async () => {
    if (!userId) return;
    setIsAdding(true);
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(userId),
        product_id: product.product_id,
        quantity,
      });
      Alert.alert("Success", "Added to cart successfully!");
      onCartUpdate?.();
    } catch {
      Alert.alert("Error", "Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuy = async () => {
    if (!userId) return;
    setIsAdding(true);
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(userId),
        product_id: product.product_id,
        quantity,
      });
      onCartUpdate?.();
      onBuy?.();
    } catch {
      Alert.alert("Error", "Failed to add to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="flex-1">
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title={product.name} />
      </Appbar.Header>
      <ScrollView className="flex-1 bg-white dark:bg-dark">
        <View className="h-72 bg-gray-200 dark:bg-gray-700 relative">
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[currentImgIdx] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Icon type="package-variant-closed" size={64} className="text-gray-400" />
            </View>
          )}
          {product.images && product.images.length > 1 && (
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-2">
              {product.images.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setCurrentImgIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentImgIdx === i ? "bg-green-500" : "bg-white/60"
                  }`}
                />
              ))}
            </View>
          )}
          <View className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/80 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {product.category}
            </Text>
          </View>
        </View>

        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-2"
          >
            {product.images.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentImgIdx(i)}
                className={`mr-2 rounded-lg overflow-hidden border-2 ${
                  currentImgIdx === i ? "border-green-500" : "border-transparent"
                }`}
              >
                <Image
                  source={{ uri: img }}
                  className="w-16 h-16"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View className="p-4">
          <Text className="text-2xl font-extrabold text-dark dark:text-light">
            {product.name}
          </Text>

          <View className="flex-row items-center mt-2 gap-2">
            <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
              <Icon type="storefront-outline" size={14} className="text-green-600 dark:text-green-400" />
              <Text className="text-sm font-medium text-green-600 dark:text-green-400 ml-1">
                {sellerName}
              </Text>
            </View>
            {sellerLocation && (
              <View className="flex-row items-center">
                <Icon type="map-marker" size={14} className="text-gray-500" />
                <Text className="text-sm text-gray-500 ml-1">{sellerLocation}</Text>
              </View>
            )}
          </View>

          <View className="mt-6">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-3xl font-black text-dark dark:text-light">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </Text>
              <Text className="text-base text-gray-500">/ {product.units}</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <View className={`w-2 h-2 rounded-full ${product.quantity > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <Text className={`text-sm font-semibold ml-2 ${product.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.quantity > 0 ? `${product.quantity} units left in stock` : "Out of Stock"}
              </Text>
            </View>
          </View>

          {product.description && (
            <View className="mt-6 pt-6 border-t border-gray-400 dark:border-gray-800">
              <Text className="text-sm text-dark dark:text-light leading-relaxed">
                {product.description}
              </Text>
            </View>
          )}

          {!isProducer && product.quantity > 0 && (
            <View className="mt-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-400 dark:border-gray-800">
              <Text className="text-sm font-bold text-dark dark:text-light uppercase mb-3">
                Quantity
              </Text>
              <View className="flex-row items-center gap-4 mb-5">
                <IconButton
                  icon="minus"
                  iconColor={quantity <= 1 ? "#9ca3af" : "#000"}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                />
                <Text className="text-lg font-bold text-dark dark:text-light w-8 text-center">
                  {quantity}
                </Text>
                <IconButton
                  icon="plus"
                  iconColor={quantity >= product.quantity ? "#9ca3af" : "#000"}
                  onPress={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity}
                />
              </View>

              <View className="flex-row gap-3">
                <Button
                  mode="outlined"
                  onPress={handleAddToCart}
                  loading={isAdding}
                  disabled={isAdding}
                  icon="cart"
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button
                  mode="contained"
                  onPress={handleBuy}
                  loading={isAdding}
                  disabled={isAdding}
                  className="flex-1"
                >
                  Buy
                </Button>
              </View>
            </View>
          )}

          {!isProducer && product.quantity === 0 && (
            <View className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-400 dark:border-red-800">
              <Text className="text-sm font-bold text-red-600 text-center">
                This product is currently out of stock.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductDetailView;

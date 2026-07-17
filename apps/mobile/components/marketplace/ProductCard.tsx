import { Icon } from "@/components/ui/Icon";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text, Button } from "@/components/ui";

export type MarketplaceProduct = {
  product_id: number;
  user_id: number;
  inventory_id: number | null;
  name: string;
  description: string | null;
  category: string;
  price: number;
  units: string;
  quantity: number;
  images: string[];
  status: "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "ARCHIVED";
  created_at: string;
  published_at: string | null;
  users?: {
    user_id: number;
    first_name: string;
    last_name: string;
    business_name: string | null;
    city: string | null;
    state: string | null;
  };
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  SOLD_OUT: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

export interface ProductCardProps {
  product: MarketplaceProduct;
  mode: "browse" | "manage" | "saved";
  isProducer?: boolean;
  isFav?: boolean;
  isWish?: boolean;
  onToggleFavorite?: (id: number) => void;
  onToggleWishlist?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onBuy?: () => void;
  onEdit?: (product: MarketplaceProduct) => void;
  onView?: (product: MarketplaceProduct) => void;
  onPublish?: (id: number) => void;
  onUnpublish?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  mode,
  isProducer = false,
  isFav = false,
  isWish = false,
  onToggleFavorite,
  onToggleWishlist,
  onAddToCart,
  onBuy,
  onEdit,
  onView,
  onPublish,
  onUnpublish,
  onDelete,
}) => {
  const sellerName = product.users
    ? product.users.business_name && product.users.business_name !== "Individual Account"
      ? product.users.business_name
      : `${product.users.first_name} ${product.users.last_name}`
    : "Unknown Seller";

  const sellerLocation =
    product.users && product.users.city
      ? `${product.users.city}${product.users.state ? `, ${product.users.state}` : ""}`
      : "";

  const handlePress = () => {
    if (mode !== "manage" && onView) onView(product);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={mode === "manage" ? 1 : 0.7}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 overflow-hidden mb-3"
    >
      <View className="h-40 bg-gray-200 dark:bg-gray-700 relative">
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Icon type="package-variant-closed" size={40} className="text-gray-400" />
          </View>
        )}
        <View className="absolute top-2 left-2">
          <View className="bg-white/90 dark:bg-gray-900/80 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {product.category}
            </Text>
          </View>
        </View>
        {mode === "manage" && (
          <View className="absolute top-2 right-2">
            <View className={`px-2 py-0.5 rounded-full ${statusColors[product.status] || "bg-gray-100"}`}>
              <Text className="text-xs font-bold">{product.status}</Text>
            </View>
          </View>
        )}
        {(mode === "browse" || mode === "saved") && !isProducer && (
          <View className="absolute top-2 right-2 flex-row gap-1">
            <Button
              mode={isFav ? "contained" : "outlined"}
              onPress={(e: any) => {
                e.stopPropagation();
                onToggleFavorite?.(product.product_id);
              }}
              icon={isFav ? "heart" : "heart-outline"}
              className="!p-2 !rounded-full bg-white/90"
            />
            <Button
              mode={isWish ? "contained" : "outlined"}
              onPress={(e: any) => {
                e.stopPropagation();
                onToggleWishlist?.(product.product_id);
              }}
              icon={isWish ? "bookmark" : "bookmark-outline"}
              className="!p-2 !rounded-full bg-white/90"
            />
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-sm font-bold text-dark dark:text-light" numberOfLines={1}>
          {product.name}
        </Text>

        {mode === "browse" && (
          <View className="flex-row items-center mt-1">
            <Icon type="storefront-outline" size={12} className="text-gray-500" />
            <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>{sellerName}</Text>
            {sellerLocation ? (
              <Text className="text-xs text-gray-400 ml-1">· {sellerLocation}</Text>
            ) : null}
          </View>
        )}

        <View className="flex-row items-center justify-between mt-2">
          <View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </Text>
              <Text className="text-xs text-gray-500">/ {product.units}</Text>
            </View>
            <Text className="text-xs text-gray-500">{product.quantity} available</Text>
          </View>

          {mode === "browse" && !isProducer && (
            <View className="flex-row gap-1">
              <Button
                mode="outlined"
                onPress={(e: any) => { e.stopPropagation(); onAddToCart?.(product.product_id); }}
                icon="cart"
                className="!p-1.5"
              />
              <Button
                mode="contained"
                onPress={(e: any) => { e.stopPropagation(); onBuy?.(); }}
                className="!px-2 !py-1"
              >
                Buy
              </Button>
            </View>
          )}

          {mode === "manage" && (
            <View className="flex-row gap-1">
              {product.status === "DRAFT" && (
                <Button mode="contained" onPress={(e: any) => { e.stopPropagation(); onPublish?.(product.product_id); }} className="!px-2 !py-1">
                  Publish
                </Button>
              )}
              {product.status === "PUBLISHED" && (
                <>
                  <Button mode="outlined" onPress={(e: any) => { e.stopPropagation(); onEdit?.(product); }} className="!px-2 !py-1">
                    Edit
                  </Button>
                  <Button mode="secondary" onPress={(e: any) => { e.stopPropagation(); onUnpublish?.(product.product_id); }} className="!px-2 !py-1">
                    Unpublish
                  </Button>
                </>
              )}
              {product.status !== "PUBLISHED" && (
                <Button
                  mode="outlined"
                  onPress={(e: any) => { e.stopPropagation(); onDelete?.(product.product_id); }}
                  icon="delete"
                  className="!p-1.5"
                />
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

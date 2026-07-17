import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text, Button, Appbar, ActivityIndicator, TextInput, SegmentedButtons, Surface } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { BottomDrawer } from "@/components/form/BottomDrawer";
import * as ImagePicker from "expo-image-picker";
import PlatformLayout from "@/components/layout/PlatformLayout";
import axiosInstance from "@/lib/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { MARKETPLACE_CATEGORIES, UNITS } from "@/constants/options";
import { ProductCard, MarketplaceProduct } from "@/components/marketplace/ProductCard";
import ProductDetailView from "@/components/marketplace/ProductDetailView";
import ListProductModal from "@/components/marketplace/ListProductModal";

type TabType = "browse" | "my_listings" | "favorites" | "wishlist" | "cart" | "orders";

const orderStatusSteps = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "RELEASED"];
const orderStatusLabels: Record<string, string> = {
  PENDING: "Placed", PAID: "Paid", SHIPPED: "Shipped", DELIVERED: "Delivered", RELEASED: "Completed", CANCELLED: "Cancelled",
};
const orderStatusIcons: Record<string, string> = {
  PENDING: "cart", PAID: "credit-card", SHIPPED: "truck-delivery", DELIVERED: "package-variant-closed", RELEASED: "check-circle",
};

const Marketplace = () => {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const { userType, subTypes } = useUserPreferences();
  const isProducer = userType === "Producer";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [myProducts, setMyProducts] = useState<MarketplaceProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("All");

  const [isListFormVisible, setListFormVisible] = useState(false);
  const [formSource, setFormSource] = useState<"inventory" | "manual">("manual");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formUnits, setFormUnits] = useState("");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showFormCatSuggestions, setShowFormCatSuggestions] = useState(false);
  const [showFormUnitSuggestions, setShowFormUnitSuggestions] = useState(false);
  const [formUnitSuggestions, setFormUnitSuggestions] = useState<string[]>(UNITS);

  const producerTabs: TabType[] = ["my_listings", "browse"];
  const buyerTabs: TabType[] = ["browse", "favorites", "wishlist", "cart", "orders"];
  const allTabs = isProducer ? producerTabs : buyerTabs;

  const [activeTab, setActiveTab] = useState<TabType>(isProducer ? "my_listings" : "browse");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<MarketplaceProduct | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<MarketplaceProduct[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<MarketplaceProduct[]>([]);

  const fetchPublishedProducts = useCallback(async () => {
    try {
      const params = selectedCategory !== "All" ? `?category=${encodeURIComponent(selectedCategory)}` : "";
      const response = await axiosInstance.get(`/marketplace/products${params}`);
      setProducts(response.data.products || []);
    } catch { setProducts([]); }
  }, [selectedCategory]);

  const fetchMyProducts = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/marketplace/products/user/${user_id}`);
      setMyProducts(response.data.products || []);
    } catch { setMyProducts([]); }
  }, [user_id]);

  const fetchInteractions = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/marketplace/interactions/user/${user_id}`);
      setFavoriteIds(response.data.favorites || []);
      setWishlistIds(response.data.wishlist || []);
    } catch { setFavoriteIds([]); setWishlistIds([]); }
  }, [user_id]);

  const fetchFavorites = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/marketplace/favorites/user/${user_id}`);
      setFavoriteProducts(response.data.products || []);
    } catch { setFavoriteProducts([]); }
  }, [user_id]);

  const fetchWishlist = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/marketplace/wishlist/user/${user_id}`);
      setWishlistProducts(response.data.products || []);
    } catch { setWishlistProducts([]); }
  }, [user_id]);

  const fetchCart = useCallback(async () => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.get(`/marketplace/cart/user/${user_id}`);
      setCartItems(response.data.items || []);
    } catch { setCartItems([]); }
  }, [user_id]);

  const fetchOrders = useCallback(async () => {
    if (!user_id || isProducer) return;
    try {
      const res = await axiosInstance.get(`/marketplace/orders/user/${user_id}`);
      setOrders(res.data.orders || []);
    } catch { setOrders([]); }
  }, [user_id, isProducer]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchPublishedProducts(),
      fetchMyProducts(),
      fetchInteractions(),
      fetchFavorites(),
      fetchWishlist(),
      fetchCart(),
      fetchOrders(),
    ]);
    setLoading(false);
  }, [fetchPublishedProducts, fetchMyProducts, fetchInteractions, fetchFavorites, fetchWishlist, fetchCart, fetchOrders]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPublishedProducts(),
      fetchMyProducts(),
      fetchInteractions(),
      fetchFavorites(),
      fetchWishlist(),
      fetchCart(),
      fetchOrders(),
    ]);
    setRefreshing(false);
  }, [fetchPublishedProducts, fetchMyProducts, fetchInteractions, fetchFavorites, fetchWishlist, fetchCart, fetchOrders]);

  const handlePublish = async (productId: number) => {
    try {
      await axiosInstance.post(`/marketplace/products/publish/${productId}`);
      Alert.alert("Published", "Product is now live on the marketplace.");
      fetchMyProducts(); fetchPublishedProducts();
    } catch { Alert.alert("Error", "Failed to publish product."); }
  };

  const handleUnpublish = async (productId: number) => {
    try {
      await axiosInstance.post(`/marketplace/products/unpublish/${productId}`);
      Alert.alert("Unpublished", "Product has been taken off the marketplace.");
      fetchMyProducts(); fetchPublishedProducts();
    } catch { Alert.alert("Error", "Failed to unpublish product."); }
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

  const openListForm = useCallback(async () => {
    setFormSource("manual");
    setFormName(""); setFormDescription(""); setFormCategory("");
    setFormPrice(""); setFormUnits(""); setFormQuantity("1");
    setFormImages([]); setSelectedInventoryId(null); setFormErrors({});
    setIsLoadingInventory(true);
    setListFormVisible(true);
    try {
      const response = await axiosInstance.get(`/inventory/${user_id}`);
      setInventoryItems(response.data.items || []);
    } catch {
      setInventoryItems([]);
    } finally {
      setIsLoadingInventory(false);
    }
  }, [user_id]);

  useEffect(() => {
    if (selectedInventoryId && formSource === "inventory") {
      const item = inventoryItems.find((i: any) => i.inventory_id === selectedInventoryId);
      if (item) { setFormName(item.item_name); setFormUnits(item.units); setFormPrice(String(item.price_per_unit)); setFormQuantity(String(item.quantity)); }
    }
  }, [selectedInventoryId, formSource, inventoryItems]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formName.trim()) e.name = "Product name is required.";
    if (!formCategory) e.category = "Category is required.";
    if (!formPrice || Number(formPrice) <= 0) e.price = "Price must be greater than 0.";
    if (!formUnits.trim()) e.units = "Units are required.";
    if (!formQuantity || Number(formQuantity) <= 0) e.quantity = "Quantity must be at least 1.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleListSubmit = async () => {
    if (!validateForm() || !user_id) return;
    setIsFormSubmitting(true);
    try {
      const base64Images = await Promise.all(formImages.map((uri) => uri.startsWith("data:") ? Promise.resolve(uri) : dataURLtoBase64(uri)));
      await axiosInstance.post("/marketplace/products/add", {
        user_id: Number(user_id), inventory_id: formSource === "inventory" ? selectedInventoryId : undefined,
        name: formName.trim(), description: formDescription.trim() || undefined, category: formCategory,
        price: Number(formPrice), units: formUnits.trim(), quantity: Number(formQuantity), images: base64Images,
      });
      Alert.alert("Success", "Product draft created. Click 'Publish' to make it live.");
      setListFormVisible(false);
      fetchMyProducts(); fetchPublishedProducts();
    } catch { Alert.alert("Error", "Failed to create product listing."); }
    finally { setIsFormSubmitting(false); }
  };

  const pickFormImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8, base64: false,
    });
    if (!result.canceled && result.assets) setFormImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  };

  const handleDelete = async (productId: number) => {
    Alert.alert("Delete Product", "Are you sure you want to remove this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await axiosInstance.delete(`/marketplace/products/delete/${productId}`);
            Alert.alert("Deleted", "Product listing removed.");
            fetchMyProducts(); fetchPublishedProducts();
          } catch { Alert.alert("Error", "Failed to delete product."); }
        },
      },
    ]);
  };

  const handleToggleFavorite = async (productId: number) => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.post("/marketplace/favorites/toggle", {
        user_id: Number(user_id), product_id: productId,
      });
      if (response.data.favorited) setFavoriteIds((prev) => [...prev, productId]);
      else setFavoriteIds((prev) => prev.filter((id) => id !== productId));
      fetchFavorites();
    } catch { Alert.alert("Error", "Failed to update favorite."); }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!user_id) return;
    try {
      const response = await axiosInstance.post("/marketplace/wishlist/toggle", {
        user_id: Number(user_id), product_id: productId,
      });
      if (response.data.wishlisted) setWishlistIds((prev) => [...prev, productId]);
      else setWishlistIds((prev) => prev.filter((id) => id !== productId));
      fetchWishlist();
    } catch { Alert.alert("Error", "Failed to update wishlist."); }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user_id) return;
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(user_id), product_id: productId, quantity: 1,
      });
      Alert.alert("Success", "Added to cart successfully!");
      fetchCart();
    } catch { Alert.alert("Error", "Failed to add to cart."); }
  };

  const handleRemoveFromCart = async (cartId: number) => {
    try {
      await axiosInstance.delete(`/marketplace/cart/remove/${cartId}`);
      fetchCart();
    } catch { Alert.alert("Error", "Failed to remove item."); }
  };

  const handleUpdateCartQuantity = async (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await axiosInstance.put(`/marketplace/cart/update/${cartId}`, { quantity: newQty });
      fetchCart();
    } catch { Alert.alert("Error", "Failed to update quantity."); }
  };

  const handleBuyNow = async (productId: number) => {
    if (!user_id) return;
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(user_id), product_id: productId, quantity: 1,
      });
      await fetchCart();
      setViewingProduct(null);
      setActiveTab("cart");
    } catch { Alert.alert("Error", "Failed to add to cart."); }
  };

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
  }, [cartItems]);

  const handleCheckout = async () => {
    if (!user_id || cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await axiosInstance.post("/marketplace/checkout/create-order", {
        user_id: Number(user_id),
      });
      const { razorpay_order_id, amount } = res.data;
      Alert.alert(
        "Checkout Initiated",
        `Order created: ${razorpay_order_id}\nAmount: ₹${(amount / 100).toLocaleString("en-IN")}\n\nPayment integration with Razorpay will open the payment sheet.`
      );
      fetchCart();
      fetchOrders();
      fetchPublishedProducts();
      fetchMyProducts();
      setActiveTab("orders");
    } catch {
      Alert.alert("Error", "Failed to initiate checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleProductAdded = () => {
    fetchMyProducts();
    fetchPublishedProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredBrowseProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [products, searchQuery]);

  const renderProductCard = (product: MarketplaceProduct, mode: "browse" | "manage" | "saved") => (
    <ProductCard
      key={product.product_id}
      product={product}
      mode={mode}
      isProducer={isProducer}
      isFav={favoriteIds.includes(product.product_id)}
      isWish={wishlistIds.includes(product.product_id)}
      onToggleFavorite={handleToggleFavorite}
      onToggleWishlist={handleToggleWishlist}
      onAddToCart={handleAddToCart}
      onBuy={() => handleBuyNow(product.product_id)}
      onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }}
      onView={setViewingProduct}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onDelete={handleDelete}
    />
  );

  const TabBar = () => (
    <View className="flex-row justify-center border-b border-gray-400 dark:border-gray-800">
      {allTabs.map((tab) => {
        const isActive = activeTab === tab;
        let label = tab.charAt(0).toUpperCase() + tab.slice(1).replace(/_/, " ");
        let count: number | undefined;
        if (tab === "my_listings") count = myProducts.length;
        else if (tab === "favorites") count = favoriteProducts.length;
        else if (tab === "wishlist") count = wishlistProducts.length;
        else if (tab === "cart") count = cartItems.length;
        else if (tab === "orders") count = orders.length;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 ${isActive ? "border-green-500" : "border-transparent"}`}
          >
            <View className="flex-row items-center gap-1">
              <Text className={`text-sm font-semibold ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                {label}
              </Text>
              {count !== undefined && count > 0 && (
                <View className="bg-green-500 rounded-full px-1.5 py-0.5">
                  <Text className="text-white text-xs font-bold">{count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderBrowse = () => (
    <View className="flex-1">
      <View className="px-4 pt-2">
        <TextInput
          mode="outlined"
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="mb-2"
          left={<TextInput.Icon icon="magnify" />}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2 py-1">
            {["All", ...MARKETPLACE_CATEGORIES].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full ${selectedCategory === cat ? "bg-green-500" : "bg-gray-400 dark:bg-gray-700"}`}
              >
                <Text className={`text-xs font-medium ${selectedCategory === cat ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <FlatList
        data={filteredBrowseProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => renderProductCard(item, "browse")}
        contentContainerClassName="flex-grow px-4 pb-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Icon type="package-variant-closed" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">
              {searchQuery ? "No products match your search." : "No products available yet."}
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderMyListings = () => (
    <View className="flex-1">
      <FlatList
        data={myProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => renderProductCard(item, "manage")}
        contentContainerClassName="flex-grow px-4 pb-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Icon type="cart-plus" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">You haven&apos;t listed any products yet.</Text>
            <Button mode="contained" onPress={() => setIsModalOpen(true)} className="mt-4">
              List Product
            </Button>
          </View>
        }
      />
    </View>
  );

  const renderFavorites = () => (
    <View className="flex-1">
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => renderProductCard(item, "saved")}
        contentContainerClassName="flex-grow px-4 pb-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Icon type="heart-outline" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">No favorite products yet.</Text>
          </View>
        }
      />
    </View>
  );

  const renderWishlist = () => (
    <View className="flex-1">
      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => renderProductCard(item, "saved")}
        contentContainerClassName="flex-grow px-4 pb-4"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Icon type="bookmark-outline" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">Your wishlist is empty.</Text>
          </View>
        }
      />
    </View>
  );

  const renderCart = () => {
    const cgst = cartTotalPrice * 0.025;
    const sgst = cartTotalPrice * 0.025;
    const grandTotal = cartTotalPrice + cgst + sgst;

    return (
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity onPress={() => setActiveTab("browse")} className="flex-row items-center mb-3">
          <Icon type="chevron-left" size={20} className="text-green-500" />
          <Text className="text-green-500 font-semibold ml-1">Back to Browse</Text>
        </TouchableOpacity>

        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <View key={item.cart_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 p-3 mb-3 flex-row">
                <TouchableOpacity onPress={() => setViewingProduct(item.product)} className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden mr-3">
                  {item.product.images?.[0] ? (
                    <Image source={{ uri: item.product.images[0] }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Icon type="package-variant-closed" size={20} className="text-gray-400" />
                    </View>
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="font-semibold text-dark dark:text-light" numberOfLines={1}>{item.product.name}</Text>
                  <Text className="text-xs text-gray-500">₹{Number(item.product.price).toLocaleString("en-IN")} / {item.product.units}</Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <TouchableOpacity
                        onPress={() => handleUpdateCartQuantity(item.cart_id, item.quantity - 1)}
                        className="px-2 py-1"
                        disabled={item.quantity <= 1}
                      >
                        <Text className={`font-bold ${item.quantity <= 1 ? "text-gray-400" : "text-dark dark:text-light"}`}>-</Text>
                      </TouchableOpacity>
                      <Text className="px-3 text-xs font-medium text-dark dark:text-light">{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleUpdateCartQuantity(item.cart_id, item.quantity + 1)}
                        className="px-2 py-1"
                        disabled={item.quantity >= item.product.quantity}
                      >
                        <Text className={`font-bold ${item.quantity >= item.product.quantity ? "text-gray-400" : "text-dark dark:text-light"}`}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-xs font-bold text-dark dark:text-light">
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFromCart(item.cart_id)} className="ml-2 justify-center">
                  <Icon type="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 p-4 mb-4">
              <Text className="text-base font-bold text-dark dark:text-light mb-3">Order Summary</Text>
              <View className="gap-2 pb-3 border-b border-gray-400 dark:border-gray-800">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Subtotal ({cartItems.length} items)</Text>
                  <Text className="text-sm text-dark dark:text-light">₹{cartTotalPrice.toLocaleString("en-IN")}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">CGST (2.5%)</Text>
                  <Text className="text-sm text-dark dark:text-light">₹{cgst.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">SGST (2.5%)</Text>
                  <Text className="text-sm text-dark dark:text-light">₹{sgst.toFixed(2)}</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center pt-3 mb-4">
                <Text className="text-base font-bold text-dark dark:text-light">Total</Text>
                <Text className="text-xl font-bold text-green-600">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <Button mode="contained" onPress={handleCheckout} loading={isCheckingOut} disabled={isCheckingOut || cartItems.length === 0}>
                {isCheckingOut ? "Processing..." : "Checkout All"}
              </Button>
              <View className="flex-row items-center justify-center mt-3">
                <Icon type="lock" size={14} className="text-gray-400" />
                <Text className="text-xs text-gray-400 ml-1">Secure checkout</Text>
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Icon type="cart" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">Your cart is empty.</Text>
            <Button mode="contained" onPress={() => setActiveTab("browse")} className="mt-4" icon="storefront-outline">
              Start Shopping
            </Button>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderOrders = () => {
    const availableYears = Array.from(
      new Set(orders.map((o) => o.created_at ? new Date(o.created_at).getFullYear().toString() : null).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a)) as string[];

    const filteredOrders = orders.filter((o) => {
      if (selectedYear === "All") return true;
      return o.created_at ? new Date(o.created_at).getFullYear().toString() === selectedYear : false;
    });

    return (
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {orders.length > 0 && (
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-gray-500">History</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {["All", ...availableYears].map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => setSelectedYear(yr)}
                    className={`px-3 py-1 rounded-full ${selectedYear === yr ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <Text className={`text-xs font-medium ${selectedYear === yr ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {yr === "All" ? "All Time" : yr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {filteredOrders.length > 0 ? filteredOrders.map((order: any) => {
          const currentStepIdx = order.status === "CANCELLED" ? -1 : orderStatusSteps.indexOf(order.status);
          return (
            <View key={order.order_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 p-4 mb-3">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-sm font-bold text-dark dark:text-light">Order #{order.order_id}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {order.created_at ? new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${
                  order.status === "CANCELLED" ? "bg-red-100" :
                  order.status === "RELEASED" ? "bg-green-100" : "bg-yellow-100"
                }`}>
                  <Text className={`text-xs font-bold ${
                    order.status === "CANCELLED" ? "text-red-700" :
                    order.status === "RELEASED" ? "text-green-700" : "text-yellow-700"
                  }`}>
                    {orderStatusLabels[order.status] || order.status}
                  </Text>
                </View>
              </View>

              {order.status !== "CANCELLED" && (
                <View className="flex-row justify-between mb-4 px-1">
                  {orderStatusSteps.map((step, i) => {
                    const isActive = i <= currentStepIdx;
                    const isLast = i === orderStatusSteps.length - 1;
                    return (
                      <View key={step} className={`flex-row items-center ${isLast ? "" : "flex-1"}`}>
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                          <Icon type={orderStatusIcons[step]} size={14} color={isActive ? "white" : "#9ca3af"} />
                        </View>
                        {!isLast && (
                          <View className={`flex-1 h-0.5 ${i < currentStepIdx ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {order.items?.map((item: any) => (
                <View key={item.order_item_id} className="flex-row items-center gap-3 py-2 border-t border-gray-400 dark:border-gray-700">
                  <View className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <Image source={{ uri: item.product.images[0] }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Icon type="package-variant-closed" size={16} className="text-gray-400" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-dark dark:text-light">{item.product?.name}</Text>
                    <Text className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}</Text>
                  </View>
                  <Text className="text-sm font-bold text-dark dark:text-light">
                    ₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}
                  </Text>
                </View>
              ))}

              <View className="flex-row justify-between items-center pt-3 mt-2 border-t border-gray-400 dark:border-gray-700">
                <Text className="text-sm text-gray-500">Total (inc. tax)</Text>
                <Text className="text-base font-bold text-green-600">
                  ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          );
        }        ) : (
          <View className="flex-1 items-center justify-center">
            <Icon type="receipt" size={48} className="text-gray-400" />
            <Text className="text-gray-500 mt-2">
              {orders.length > 0 ? `No orders found for ${selectedYear}.` : "No orders yet."}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "browse": return renderBrowse();
      case "my_listings": return renderMyListings();
      case "favorites": return renderFavorites();
      case "wishlist": return renderWishlist();
      case "cart": return renderCart();
      case "orders": return renderOrders();
      default: return renderBrowse();
    }
  };

  if (viewingProduct) {
    return (
      <PlatformLayout>
        <SafeAreaView className="flex-1 bg-white dark:bg-dark">
          <ProductDetailView
            product={viewingProduct}
            userId={user_id}
            onBack={() => setViewingProduct(null)}
            onCartUpdate={fetchCart}
            isProducer={isProducer}
            onBuy={() => { setViewingProduct(null); setActiveTab("cart"); }}
          />
        </SafeAreaView>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1 bg-white dark:bg-dark">
        <Appbar.Header>
          <Appbar.Content title="Marketplace" subtitle={isProducer ? "Manage your listings" : "Discover farm produce"} />
          {isProducer ? (
            <Button mode="contained" onPress={openListForm} className="!px-3 !py-1.5 mr-2">
              List Product
            </Button>
          ) : (
            <TouchableOpacity onPress={() => setActiveTab("cart")} className="mr-2 relative">
              <Icon type="cart" size={24} className="text-dark dark:text-light" />
              {cartItems.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </Appbar.Header>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View className="flex-1">
            <TabBar />
            {renderTabContent()}
          </View>
        )}

        {isModalOpen && user_id && (
          <ListProductModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
            userId={user_id}
            onProductAdded={handleProductAdded}
            productToEdit={editingProduct || undefined}
          />
        )}

        <BottomDrawer
          isVisible={isListFormVisible}
          onClose={() => setListFormVisible(false)}
          title="List New Product"
          onSubmit={handleListSubmit}
          submitButtonText={isFormSubmitting ? "Saving..." : "Create Draft"}
          isSubmitting={isFormSubmitting}
        >
          <SegmentedButtons
            value={formSource}
            onValueChange={(val: string) => {
              setFormSource(val as "inventory" | "manual");
              setSelectedInventoryId(null);
              if (val === "manual") { setFormName(""); setFormPrice(""); setFormUnits(""); setFormQuantity("1"); }
            }}
            buttons={[
              { value: "manual", label: "Manual Entry" },
              { value: "inventory", label: "From Inventory" },
            ]}
          />

          {formSource === "inventory" && (
            <View className="mb-4 mt-2">
              {isLoadingInventory ? (
                <ActivityIndicator className="py-4" />
              ) : inventoryItems.length === 0 ? (
                <Text className="text-sm text-gray-500 py-4">No inventory items found. Use manual entry instead.</Text>
              ) : (
                <View className="gap-2 mt-2">
                  {inventoryItems.map((item: any) => (
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

          <TextInput
            mode="outlined" label="Product Name" placeholder="e.g., Organic Honey"
            value={formName} onChangeText={setFormName}
            error={!!formErrors.name}
            disabled={formSource === "inventory" && !!selectedInventoryId}
          />
          {formErrors.name && <Text className="text-red-500 text-xs -mt-2">{formErrors.name}</Text>}

          <View className="z-10">
            <TextInput
              mode="outlined" label="Category" placeholder="Select a category"
              value={formCategory}
              onChangeText={(t: string) => { setFormCategory(t); setShowFormCatSuggestions(true); }}
              onFocus={() => { setShowFormCatSuggestions(true); setShowFormUnitSuggestions(false); }}
              onBlur={() => setTimeout(() => setShowFormCatSuggestions(false), 200)}
              error={!!formErrors.category}
            />
            {showFormCatSuggestions && subTypes.length > 0 && formCategory.length > 0 && (
              <Surface className="absolute top-[52px] left-0 right-0 z-20 rounded-lg overflow-hidden bg-white dark:bg-dark-surface" elevation={3}>
                {subTypes.filter((s) => s.toLowerCase().includes(formCategory.toLowerCase())).slice(0, 5).map((s) => (
                  <TouchableOpacity key={s} onPress={() => { setFormCategory(s); setShowFormCatSuggestions(false); }} className="px-3 py-2">
                    <Text className="text-sm text-dark dark:text-light">{s}</Text>
                  </TouchableOpacity>
                ))}
              </Surface>
            )}
            {formErrors.category && <Text className="text-red-500 text-xs">{formErrors.category}</Text>}
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <TextInput mode="outlined" label="Price (₹)" placeholder="e.g., 250.00"
                value={formPrice} onChangeText={(t: string) => setFormPrice(t.replace(/[^0-9.]/g, ""))}
                keyboardType="numeric" error={!!formErrors.price}
              />
              {formErrors.price && <Text className="text-red-500 text-xs">{formErrors.price}</Text>}
            </View>
            <View className="flex-1">
              <TextInput mode="outlined" label="Quantity" placeholder="e.g., 10"
                value={formQuantity} onChangeText={(t: string) => setFormQuantity(t.replace(/[^0-9]/g, ""))}
                keyboardType="numeric" error={!!formErrors.quantity}
              />
              {formErrors.quantity && <Text className="text-red-500 text-xs">{formErrors.quantity}</Text>}
            </View>
          </View>

          <View className="relative z-20">
            <TextInput mode="outlined" label="Unit" placeholder="e.g., kg"
              value={formUnits}
              onChangeText={(t: string) => { setFormUnits(t); setFormUnitSuggestions(UNITS.filter((u) => u.toLowerCase().includes(t.toLowerCase()))); setShowFormUnitSuggestions(true); }}
              onFocus={() => { setFormUnitSuggestions(UNITS); setShowFormUnitSuggestions(true); setShowFormCatSuggestions(false); }}
              error={!!formErrors.units}
              disabled={formSource === "inventory" && !!selectedInventoryId}
            />
            {showFormUnitSuggestions && formUnitSuggestions.length > 0 && (
              <Surface className="absolute top-[52px] left-0 right-0 z-30 rounded-lg overflow-hidden bg-white dark:bg-dark-surface" elevation={3}>
                {formUnitSuggestions.map((s) => (
                  <TouchableOpacity key={s} onPress={() => { setFormUnits(s); setShowFormUnitSuggestions(false); }} className="px-3 py-2">
                    <Text className="text-sm text-dark dark:text-light">{s}</Text>
                  </TouchableOpacity>
                ))}
              </Surface>
            )}
            {formErrors.units && <Text className="text-red-500 text-xs">{formErrors.units}</Text>}
          </View>

          <View>
            <Text className="text-sm font-medium text-dark dark:text-light mb-2">Product Images</Text>
            <View className="flex-row flex-wrap gap-2">
              {formImages.map((uri, i) => (
                <View key={i} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" resizeMode="cover" />
                  <TouchableOpacity onPress={() => setFormImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                    <Icon type="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={pickFormImages} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 items-center justify-center">
                <Icon type="camera" size={24} className="text-gray-400" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-dark dark:text-light mb-1">Description</Text>
            <TextInput mode="outlined" placeholder="Describe your product..." value={formDescription} onChangeText={setFormDescription} multiline numberOfLines={4} />
          </View>
        </BottomDrawer>
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default Marketplace;

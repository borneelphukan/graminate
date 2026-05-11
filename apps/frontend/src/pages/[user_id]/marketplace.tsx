import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button, Icon, Popup, Tabs, SearchBar, Badge, Dropdown, Stepper, StepperItem, StepperIndicator, StepperContent, StepperTitle } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import ListProductModal from "@/components/modals/ListProductModal";
import ProductDetailView from "@/components/marketplace/ProductDetailView";
import { MARKETPLACE_CATEGORIES } from "@/constants/options";

import ProductCard, { MarketplaceProduct } from "@/components/cards/ProductCard";

const MarketplacePage = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const currentUserId = useMemo(
    () => (Array.isArray(user_id) ? user_id[0] : user_id),
    [user_id]
  );

  const { userType } = useUserPreferences();
  const isProducer = userType === "Producer";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [myProducts, setMyProducts] = useState<MarketplaceProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("All");

  const [activeTab, setActiveTab] = useState<"browse" | "my_listings" | "favorites" | "wishlist" | "cart" | "orders">(

    isProducer ? "my_listings" : "browse"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<MarketplaceProduct | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<MarketplaceProduct[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<MarketplaceProduct[]>([]);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  const fetchPublishedProducts = useCallback(async () => {
    try {
      const params = selectedCategory !== "All" ? `?category=${encodeURIComponent(selectedCategory)}` : "";
      const response = await axiosInstance.get(`/marketplace/products${params}`);
      setProducts(response.data.products || []);
    } catch {
      setProducts([]);
    }
  }, [selectedCategory]);

  const fetchMyProducts = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.get(`/marketplace/products/user/${currentUserId}`);
      setMyProducts(response.data.products || []);
    } catch {
      setMyProducts([]);
    }
  }, [currentUserId]);

  const fetchInteractions = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.get(`/marketplace/interactions/user/${currentUserId}`);
      setFavoriteIds(response.data.favorites || []);
      setWishlistIds(response.data.wishlist || []);
    } catch {
      setFavoriteIds([]);
      setWishlistIds([]);
    }
  }, [currentUserId]);

  const fetchFavorites = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.get(`/marketplace/favorites/user/${currentUserId}`);
      setFavoriteProducts(response.data.products || []);
    } catch {
      setFavoriteProducts([]);
    }
  }, [currentUserId]);

  const fetchWishlist = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.get(`/marketplace/wishlist/user/${currentUserId}`);
      setWishlistProducts(response.data.products || []);
    } catch {
      setWishlistProducts([]);
    }
  }, [currentUserId]);

  const fetchCart = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.get(`/marketplace/cart/user/${currentUserId}`);
      setCartItems(response.data.items || []);
    } catch {
      setCartItems([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!router.isReady || !currentUserId) return;
    setLoading(true);
    Promise.all([
      fetchPublishedProducts(),
      fetchMyProducts(),
      fetchInteractions(),
      fetchFavorites(),
      fetchWishlist(),
      fetchCart(),
    ]).finally(() => setLoading(false));
  }, [router.isReady, currentUserId, fetchPublishedProducts, fetchMyProducts, fetchInteractions, fetchFavorites, fetchWishlist, fetchCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = isProducer ? "marketplace_tab_producer" : "marketplace_tab_seller";
    const saved = localStorage.getItem(key);
    const validProducerTabs = ["my_listings", "browse"];
    const validSellerTabs = ["browse", "favorites", "wishlist", "cart", "orders"];

    if (saved && (isProducer ? validProducerTabs.includes(saved) : validSellerTabs.includes(saved))) {
      setActiveTab(saved as any);
    } else {
      setActiveTab(isProducer ? "my_listings" : "browse");
    }
  }, [isProducer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = isProducer ? "marketplace_tab_producer" : "marketplace_tab_seller";
    localStorage.setItem(key, activeTab);
  }, [activeTab, isProducer]);

  const handlePublish = async (productId: number) => {
    try {
      await axiosInstance.post(`/marketplace/products/publish/${productId}`);
      setPopup({ isOpen: true, title: "Published", text: "Product is now live on the marketplace.", variant: "success" });
      fetchMyProducts();
      fetchPublishedProducts();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to publish product.", variant: "error" });
    }
  };

  const handleUnpublish = async (productId: number) => {
    try {
      await axiosInstance.post(`/marketplace/products/unpublish/${productId}`);
      setPopup({ isOpen: true, title: "Unpublished", text: "Product has been taken off the marketplace.", variant: "info" });
      fetchMyProducts();
      fetchPublishedProducts();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to unpublish product.", variant: "error" });
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await axiosInstance.delete(`/marketplace/products/delete/${productId}`);
      setPopup({ isOpen: true, title: "Deleted", text: "Product listing removed.", variant: "success" });
      fetchMyProducts();
      fetchPublishedProducts();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to delete product.", variant: "error" });
    }
  };

  const handleToggleFavorite = async (productId: number) => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.post("/marketplace/favorites/toggle", {
        user_id: Number(currentUserId),
        product_id: productId,
      });
      if (response.data.favorited) {
        setFavoriteIds((prev) => [...prev, productId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
      }
      fetchFavorites();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to update favorite.", variant: "error" });
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!currentUserId) return;
    try {
      const response = await axiosInstance.post("/marketplace/wishlist/toggle", {
        user_id: Number(currentUserId),
        product_id: productId,
      });
      if (response.data.wishlisted) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      fetchWishlist();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to update wishlist.", variant: "error" });
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!currentUserId) return;
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(currentUserId),
        product_id: productId,
        quantity: 1,
      });
      setPopup({ isOpen: true, title: "Success", text: "Added to cart successfully!", variant: "success" });
      fetchCart();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to add to cart.", variant: "error" });
    }
  };

  const handleRemoveFromCart = async (cartId: number) => {
    try {
      await axiosInstance.delete(`/marketplace/cart/remove/${cartId}`);
      fetchCart();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to remove item.", variant: "error" });
    }
  };

  const handleUpdateCartQuantity = async (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await axiosInstance.put(`/marketplace/cart/update/${cartId}`, { quantity: newQty });
      fetchCart();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to update quantity.", variant: "error" });
    }
  };

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
  }, [cartItems]);

  const fetchOrders = useCallback(async () => {
    if (!currentUserId || isProducer) return;
    try {
      const res = await axiosInstance.get(`/marketplace/orders/user/${currentUserId}`);
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    }
  }, [currentUserId, isProducer]);

  useEffect(() => {
    if (currentUserId && !isProducer) fetchOrders();
  }, [currentUserId, isProducer, fetchOrders]);

  const handleCheckout = async () => {
    if (!currentUserId || cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await axiosInstance.post("/marketplace/checkout/create-order", {
        user_id: Number(currentUserId),
      });
      const { razorpay_order_id, amount, currency, key_id } = res.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: "Graminate Marketplace",
        description: "Purchase farm produce",
        order_id: razorpay_order_id,
        handler: async (response: any) => {
          try {
            await axiosInstance.post("/marketplace/checkout/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPopup({ isOpen: true, title: "Payment Successful", text: "Your order has been placed successfully!", variant: "success" });
            fetchCart();
            fetchOrders();
            setActiveTab("orders");
          } catch {
            setPopup({ isOpen: true, title: "Verification Failed", text: "Payment could not be verified. Please contact support.", variant: "error" });
          }
        },
        theme: { color: "#04ad79" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        setPopup({ isOpen: true, title: "Payment Failed", text: "Payment was unsuccessful. Please try again.", variant: "error" });
      });
      rzp.open();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to initiate checkout.", variant: "error" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleBuyNow = async (productId: number) => {
    if (!currentUserId) return;
    try {
      await axiosInstance.post("/marketplace/cart/add", {
        user_id: Number(currentUserId),
        product_id: productId,
        quantity: 1,
      });
      await fetchCart();
      setViewingProduct(null);
      setActiveTab("cart");
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to add to cart.", variant: "error" });
    }
  };

  const orderStatusSteps = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "RELEASED"];
  const orderStatusLabels: Record<string, string> = {
    PENDING: "Placed",
    PAID: "Paid",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    RELEASED: "Completed",
    CANCELLED: "Cancelled",
  };

  const orderStatusIcons: Record<string, string> = {
    PENDING: "shopping_cart",
    PAID: "payments",
    SHIPPED: "local_shipping",
    DELIVERED: "inventory_2",
    RELEASED: "task_alt",
  };

  const orderStatusDates: Record<string, string> = {
    PENDING: "created_at",
    PAID: "paid_at",
    SHIPPED: "shipped_at",
    DELIVERED: "delivered_at",
    RELEASED: "released_at",
  };

  const filteredBrowseProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [products, searchQuery]);

  const handleProductAdded = () => {
    fetchMyProducts();
    fetchPublishedProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const renderProductCard = useCallback((product: MarketplaceProduct, mode: "browse" | "manage" | "saved") => (
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
      onEdit={(p) => {
        setEditingProduct(p);
        setIsModalOpen(true);
      }}
      onView={setViewingProduct}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onDelete={handleDelete}
    />
  ), [
    favoriteIds,
    wishlistIds,
    handlePublish,
    handleUnpublish,
    handleDelete,
    handleToggleFavorite,
    handleToggleWishlist,
    handleAddToCart,
    handleBuyNow,
    setEditingProduct,
    setIsModalOpen,
    setViewingProduct,
    isProducer,
  ]);

  const renderEmptyState = useCallback((message: string, icon: string) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-200 flex items-center justify-center mb-4">
        <Icon type={icon} className="text-4xl! text-dark dark:text-light" />
      </div>
      <p className="text-dark dark:text-light text-sm">{message}</p>
    </div>
  ), []);

  const renderCartView = () => {
    const cgst = cartTotalPrice * 0.025;
    const sgst = cartTotalPrice * 0.025;
    const grandTotal = cartTotalPrice + cgst + sgst;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            icon={{ left: "chevron_left" }}
            onClick={() => setActiveTab("browse")}
            label="Back"
          />
        </div>
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  onClick={() => setViewingProduct(item.product)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-400 dark:border-gray-800 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow duration-200 group"
                >
                  <div className="w-20 h-20 rounded-lg bg-gray-400 dark:bg-gray-700 flex items-center justify-center text-3xl shrink-0 transition-colors group-hover:bg-gray-400 dark:group-hover:bg-gray-600 overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-dark dark:text-light truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-dark dark:text-light mt-0.5">
                      ₹{Number(item.product.price).toLocaleString("en-IN")} / {item.product.units}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div 
                        className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 h-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleUpdateCartQuantity(item.cart_id, item.quantity - 1)}
                          className="px-2 hover:bg-gray-400 dark:hover:bg-gray-700 rounded-l-md text-dark dark:text-light font-bold text-sm disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-medium text-dark dark:text-light">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQuantity(item.cart_id, item.quantity + 1)}
                          className="px-2 hover:bg-gray-400 dark:hover:bg-gray-700 rounded-r-md text-dark dark:text-light font-bold text-sm disabled:opacity-50"
                          disabled={item.quantity >= item.product.quantity}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-dark dark:text-light">
                        Subtotal: ₹{(Number(item.product.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={{ left: "delete" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromCart(item.cart_id);
                    }}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Remove Item"
                  />
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-400 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-dark dark:text-light mb-4">Order Summary</h3>
                <div className="space-y-3 pb-4 border-b border-gray-400 dark:border-gray-800 text-sm">
                  <div className="flex justify-between text-dark dark:text-light">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{cartTotalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-dark dark:text-light">
                    <span>CGST (2.5%)</span>
                    <span>₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-dark dark:text-light">
                    <span>SGST (2.5%)</span>
                    <span>₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 mb-6">
                  <span className="text-base font-bold text-dark dark:text-light">Total</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Button
                  label={isCheckingOut ? "Processing..." : "Checkout All"}
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                />
                <p className="text-xs text-center text-dark dark:text-light mt-4 flex items-center justify-center gap-1">
                  <Icon type="lock" className="text-xs!" /> Secure checkout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-400 dark:border-gray-800 shadow-sm mt-4 min-h-[50vh]">
            {renderEmptyState("Your cart is empty.", "shopping_cart")}
            <Button 
              label="Start Shopping" 
              variant="primary" 
              onClick={() => setActiveTab("browse")} 
              className="-mt-10"
              icon={{ left: "storefront" }}
            />
          </div>
        )}
      </div>
    );
  };

  const marketplaceTabs = useMemo(() => {
    const tabs = [];

    if (isProducer) {
      tabs.push({
        value: "my_listings",
        label: `My Listings (${myProducts.length})`,
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myProducts.length > 0
              ? myProducts.map((p) => renderProductCard(p, "manage"))
              : renderEmptyState(
                  "You haven't listed any products yet. Click 'List Product' to get started.",
                  "add_shopping_cart"
                )}
          </div>
        ),
      });
    }

    tabs.push({
      value: "browse",
      label: "Browse",
      content: (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={searchQuery}
              placeholder="Search products..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-green-200 text-white"
                  : "bg-gray-400 dark:bg-light text-dark"
              }`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-green-200 text-white"
                    : "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBrowseProducts.length > 0
              ? filteredBrowseProducts.map((p) => renderProductCard(p, "browse"))
              : renderEmptyState(
                  searchQuery
                    ? "No products match your search."
                    : "No products available yet.",
                  "inventory_2"
                )}
          </div>
        </div>
      ),
    });

    if (!isProducer) {
      tabs.push(
        {
          value: "favorites",
          label: `Favorites (${favoriteProducts.length})`,
          icon: "favorite" as any,
          content: (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteProducts.length > 0
                ? favoriteProducts.map((p) => renderProductCard(p, "saved"))
                : renderEmptyState("No favorite products yet.", "favorite_border")}
            </div>
          ),
        },
        {
          value: "wishlist",
          label: `Wishlist (${wishlistProducts.length})`,
          icon: "bookmark" as any,
          content: (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistProducts.length > 0
                ? wishlistProducts.map((p) => renderProductCard(p, "saved"))
                : renderEmptyState("Your wishlist is empty.", "bookmark_border")}
            </div>
          ),
        }
      );
    }

    if (!isProducer) {
      const availableYears = Array.from(
        new Set(
          orders
            .map((o) => (o.created_at ? new Date(o.created_at).getFullYear().toString() : null))
            .filter(Boolean)
        )
      ).sort((a, b) => Number(b) - Number(a)) as string[];

      const filteredOrdersByYear = orders.filter((o) => {
        if (selectedYear === "All") return true;
        const yr = o.created_at ? new Date(o.created_at).getFullYear().toString() : "";
        return yr === selectedYear;
      });

      tabs.push({
        value: "orders",
        label: `Orders (${orders.length})`,
        content: (
          <div className="space-y-4">
            {orders.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-400 dark:border-gray-800 mb-4">
                <h3 className="text-sm font-bold text-dark dark:text-light opacity-80">History</h3>
                <div className="w-full sm:w-48">
                  <Dropdown
                    items={["All", ...availableYears]}
                    selectedItem={selectedYear === "All" ? "All Time" : selectedYear}
                    onSelect={(val) => setSelectedYear(val === "All Time" ? "All" : val)}
                    placeholder="Select Year"
                    variant="small"
                    width="full"
                  />
                </div>
              </div>
            )}

            {filteredOrdersByYear.length > 0 ? (
              filteredOrdersByYear.map((order: any) => {
                const currentStepIdx = order.status === "CANCELLED" ? -1 : orderStatusSteps.indexOf(order.status);
                return (
                  <div key={order.order_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-dark dark:text-light">Order #{order.order_id}</h4>
                        <p className="text-xs text-dark dark:text-light mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                        </p>
                      </div>
                      <Badge type={order.status === "CANCELLED" ? "error" : order.status === "RELEASED" ? "success" : "warning"} label={orderStatusLabels[order.status] || order.status} />
                    </div>

                    {order.status !== "CANCELLED" && (
                      <div className="mb-6 pt-2 px-2">
                        <Stepper activeStep={currentStepIdx} orientation="horizontal" className="w-full">
                          {orderStatusSteps.map((step) => (
                            <StepperItem key={step}>
                              <StepperIndicator 
                                className="scale-90" 
                                icon={<Icon type={orderStatusIcons[step]} size="lg" />}
                              />
                              <StepperContent>
                                <StepperTitle className="text-[10px] sm:text-xs font-semibold text-dark dark:text-light mt-1 truncate">
                                  {orderStatusLabels[step]}
                                </StepperTitle>
                                {order[orderStatusDates[step]] && (
                                  <div className="text-[8px] sm:text-[9px] text-dark/60 dark:text-light/60 leading-tight mt-0.5 whitespace-nowrap">
                                    {new Date(order[orderStatusDates[step]]).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                                  </div>
                                )}
                              </StepperContent>
                            </StepperItem>
                          ))}
                        </Stepper>
                      </div>
                    )}

                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.order_item_id} className="flex items-center gap-3 py-2 border-t border-gray-400 dark:border-gray-700">
                          <div className="w-10 h-10 rounded bg-gray-400 dark:bg-gray-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark dark:text-light truncate">{item.product?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <p className="text-xs text-dark dark:text-light">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}</p>
                              {item.producer && (
                                <Badge
                                  size="sm"
                                  type="default"
                                  iconLeft="storefront"
                                  label={
                                    item.producer.business_name && item.producer.business_name !== "Individual Account"
                                      ? item.producer.business_name
                                      : `${item.producer.first_name} ${item.producer.last_name}`
                                  }
                                />
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-dark dark:text-light">₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-400 dark:border-gray-700">
                      <span className="text-sm text-dark dark:text-light">Total (inc. tax)</span>
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400">₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              renderEmptyState(
                orders.length > 0 
                  ? `No orders found for the year ${selectedYear}.` 
                  : "No orders yet. Purchase items to see them here.", 
                "receipt_long"
              )
            )}
          </div>
        ),
      });
    }

    return tabs;
  }, [
    isProducer,
    myProducts,
    favoriteProducts,
    wishlistProducts,
    filteredBrowseProducts,
    selectedCategory,
    searchQuery,
    renderProductCard,
    renderEmptyState,
    orders,
    isCheckingOut,
    selectedYear,
  ]);

  return (
    <>
      <Head>
        <title>Marketplace | Graminate</title>
        <meta name="description" content="Buy and sell farm produce on the Graminate marketplace" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen bg-light dark:bg-gray-900 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
                    <Icon type="storefront" />
                    Marketplace
                  </h1>
                  <p className="text-xs text-dark dark:text-light mt-0.5">
                    {isProducer
                      ? "Manage your product listings and browse the marketplace"
                      : "Discover and purchase farm produce from producers"}
                  </p>
                </div>
                {isProducer ? (
                  <Button
                    label="List Product"
                    variant="primary"
                    icon={{ left: "add" }}
                    onClick={() => setIsModalOpen(true)}
                  />
                ) : (
                  <Button
                    label={`Cart (${cartItems.length})`}
                    variant="primary"
                    icon={{ left: "shopping_cart" }}
                    onClick={() => setActiveTab("cart")}
                  />
                )}
              </header>

              {viewingProduct ? (
                <ProductDetailView
                  product={viewingProduct}
                  userId={currentUserId}
                  onBack={() => setViewingProduct(null)}
                  onCartUpdate={fetchCart}
                  isProducer={isProducer}
                  onBuy={() => {
                    setViewingProduct(null);
                    setActiveTab("cart");
                  }}
                />
              ) : activeTab === "cart" ? (
                renderCartView()
              ) : (
                <Tabs
                  tabs={marketplaceTabs}
                  activeTab={activeTab}
                  onTabChange={(val) => setActiveTab(val as any)}
                />
              )}
            </>
          )}
        </main>
      </PlatformLayout>

      {isModalOpen && currentUserId && (
        <ListProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          userId={currentUserId}
          onProductAdded={handleProductAdded}
          productToEdit={editingProduct || undefined}
        />
      )}


      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </>
  );
};

export default MarketplacePage;

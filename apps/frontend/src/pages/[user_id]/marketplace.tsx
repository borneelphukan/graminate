import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button, Icon, Popup, Tabs, SearchBar, Badge } from "@graminate/ui";
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
  const [activeTab, setActiveTab] = useState<"browse" | "my_listings" | "favorites" | "wishlist" | "cart">(
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
    const validSellerTabs = ["browse", "favorites", "wishlist", "cart"];

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
                  label="Checkout All"
                  variant="primary"
                  className="w-full"
                  disabled
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
  ]);

  return (
    <>
      <Head>
        <title>Marketplace | Graminate</title>
        <meta name="description" content="Buy and sell farm produce on the Graminate marketplace" />
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

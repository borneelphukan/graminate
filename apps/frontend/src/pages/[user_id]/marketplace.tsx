import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button, Icon, Popup, Tabs, SearchBar, Badge } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import ListProductModal from "@/components/modals/ListProductModal";
import { MARKETPLACE_CATEGORIES } from "@/constants/options";

type MarketplaceProduct = {
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

const statusToBadgeType: Record<string, "warning" | "success" | "error" | "default"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  SOLD_OUT: "error",
  ARCHIVED: "default",
};

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
  const [activeTab, setActiveTab] = useState<"browse" | "my_listings" | "favorites" | "wishlist">(
    isProducer ? "my_listings" : "browse"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
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

  useEffect(() => {
    if (!router.isReady || !currentUserId) return;
    setLoading(true);
    Promise.all([
      fetchPublishedProducts(),
      fetchMyProducts(),
      fetchInteractions(),
      fetchFavorites(),
      fetchWishlist(),
    ]).finally(() => setLoading(false));
  }, [router.isReady, currentUserId, fetchPublishedProducts, fetchMyProducts, fetchInteractions, fetchFavorites, fetchWishlist]);

  useEffect(() => {
    if (isProducer) {
      setActiveTab("my_listings");
    } else {
      setActiveTab("browse");
    }
  }, [isProducer]);

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
    setIsModalOpen(false);
  };

  const renderProductCard = useCallback((
    product: MarketplaceProduct,
    mode: "browse" | "manage" | "saved"
  ) => {
    const isFav = favoriteIds.includes(product.product_id);
    const isWish = wishlistIds.includes(product.product_id);
    const sellerName = product.users
      ? product.users.business_name ||
        `${product.users.first_name} ${product.users.last_name}`
      : "Unknown Seller";
    const sellerLocation =
      product.users && product.users.city
        ? `${product.users.city}${product.users.state ? `, ${product.users.state}` : ""}`
        : "";

    return (
      <div
        key={product.product_id}
        className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
      >
        <div className="relative h-44 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
          <span className="text-5xl">📦</span>
          <div className="absolute top-2 left-2">
            <Badge
              label={`📦 ${product.category}`}
              type="default"
              size="sm"
              className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-none font-semibold text-gray-700 dark:text-gray-300"
            />
          </div>
          {mode === "manage" && (
            <div className="absolute top-2 right-2">
              <Badge
                type={statusToBadgeType[product.status]}
                label={product.status}
                size="sm"
                className="font-semibold shadow-sm"
              />
            </div>
          )}
          {mode === "browse" && (
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(product.product_id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isFav
                    ? "bg-red-500 text-white"
                    : "bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                }`}
                title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Icon type={isFav ? "favorite" : "favorite_border"} className="text-base!" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(product.product_id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isWish
                    ? "bg-green-200 text-white"
                    : "bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300 hover:bg-green-300 dark:hover:bg-green-100"
                }`}
                title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Icon type={isWish ? "bookmark" : "bookmark_border"} className="text-base!" />
              </button>
            </div>
          )}
          {mode === "saved" && (
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(product.product_id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isFav
                    ? "bg-red-500 text-white"
                    : "bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300"
                }`}
                title="Toggle Favorite"
              >
                <Icon type={isFav ? "favorite" : "favorite_border"} className="text-base!" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(product.product_id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                  isWish
                    ? "bg-indigo-500 text-white"
                    : "bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-300"
                }`}
                title="Toggle Wishlist"
              >
                <Icon type={isWish ? "bookmark" : "bookmark_border"} className="text-base!" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-dark dark:text-light mt-1 line-clamp-2">
              {product.description}
            </p>
          )}

          {mode === "browse" && (
            <div className="flex items-center gap-1.5 mt-2">
              <Icon type="storefront" className="text-xs! text-dark" />
              <span className="text-xs text-dark dark:text-light truncate">
                {sellerName}
              </span>
              {sellerLocation && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-dark dark:text-light truncate">{sellerLocation}</span>
                </>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-dark dark:text-light">
                per {product.units} · {product.quantity} available
              </p>
            </div>

            {mode === "browse" && (
              <Button label="Buy" variant="primary" size="sm" disabled />
            )}

            {mode === "manage" && (
              <div className="flex gap-1.5">
                {product.status === "DRAFT" && (
                  <Button
                    label="Publish"
                    variant="primary"
                    
                    onClick={() => handlePublish(product.product_id)}
                  />
                )}
                {product.status === "PUBLISHED" && (
                  <Button
                    label="Unpublish"
                    variant="secondary"
                    onClick={() => handleUnpublish(product.product_id)}
                  />
                )}
                <Button
                  onClick={() => handleDelete(product.product_id)}
                  variant="destructive"
                  size="sm"
                  icon={{ left: "delete" }}
                  title="Delete"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [favoriteIds, wishlistIds, handlePublish, handleUnpublish, handleDelete, handleToggleFavorite, handleToggleWishlist]);

  const renderEmptyState = useCallback((message: string, icon: string) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-200 flex items-center justify-center mb-4">
        <Icon type={icon} className="text-4xl! text-dark dark:text-light" />
      </div>
      <p className="text-dark dark:text-light text-sm">{message}</p>
    </div>
  ), []);

  const marketplaceTabs = useMemo(() => {
    const tabs = [
      {
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
                    : "bg-gray-400 dark:bg-light text-dark dark:text-light"
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
                      : "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBrowseProducts.length > 0 ? filteredBrowseProducts.map((p) => renderProductCard(p, "browse")) : renderEmptyState(
                    searchQuery
                      ? "No products match your search.": "No products available yet.",
                    "inventory_2"
                  )}
            </div>
          </div>
        ),
      },
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
      },
    ];

    if (isProducer) {
      tabs.unshift({
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

    return tabs;
  }, [
    isProducer,
    myProducts,
    favoriteProducts,
    wishlistProducts,
    searchQuery,
    selectedCategory,
    filteredBrowseProducts,
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon type="storefront" />
                    Marketplace
                  </h1>
                  <p className="text-xs text-dark dark:text-light mt-0.5">
                    {isProducer
                      ? "Manage your product listings and browse the marketplace"
                      : "Discover and purchase farm produce from producers"}
                  </p>
                </div>
                {isProducer && (
                  <Button
                    label="List Product"
                    variant="primary"
                    icon={{ left: "add" }}
                    onClick={() => setIsModalOpen(true)}
                  />
                )}
              </header>

              <Tabs
                tabs={marketplaceTabs}
                activeTab={activeTab}
                onTabChange={(val) => setActiveTab(val as any)}
              />
            </>
          )}
        </main>
      </PlatformLayout>

      {isModalOpen && currentUserId && (
        <ListProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={currentUserId}
          onProductAdded={handleProductAdded}
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

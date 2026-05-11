import { Icon, Button, Badge, Popup } from "@graminate/ui";
import React, { useState } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        quantity: quantity,
      });
      setPopup({
        isOpen: true,
        title: "Success",
        text: "Added to cart successfully!",
        variant: "success",
      });
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Failed to add to cart.",
        variant: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center">
        <Button
          variant="ghost"
          label="Back"
          icon={{ left: "chevron_left" }}
          onClick={onBack}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-400 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Side: Images Column (5 grid slots) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden relative group flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImgIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImgIdx(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-md backdrop-blur-sm"
                      >
                        <Icon type="chevron_left" className="w-5 h-5 text-dark dark:text-light" />
                      </button>
                      <button
                        onClick={() => setCurrentImgIdx(prev => (prev + 1) % product.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-md backdrop-blur-sm"
                      >
                        <Icon type="chevron_right" className="w-5 h-5 text-dark dark:text-light" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span className="text-9xl opacity-30 transition-transform duration-500 group-hover:scale-110">📦</span>
              )}
              <div className="absolute top-3 right-3">
                <Badge label={product.category} type="default" />
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImgIdx(i)}
                    className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                      currentImgIdx === i ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Detail Column (7 grid slots) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-light tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-dark dark:text-light text-sm sm:text-base">
                <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                  <Icon type="storefront" className="text-base!" />
                  <span>{sellerName}</span>
                </div>
                {sellerLocation && (
                  <div className="flex items-center gap-1.5 text-dark dark:text-light">
                    <Icon type="location_on" className="text-sm!" />
                    <span>{sellerLocation}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none pb-6 mb-6 border-b border-gray-400 dark:border-gray-700">
              <div className="text-dark dark:text-light leading-relaxed prose dark:prose-invert prose-sm sm:prose-base">
                {product.description ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 whitespace-pre-line" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-sm sm:text-base" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-extrabold" {...props} />,
                      em: ({ node, ...props }) => <em className="italic" {...props} />,
                    }}
                  >
                    {product.description}
                  </ReactMarkdown>
                ) : (
                  "No product details available."
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-dark dark:text-light">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <span className="text-lg text-dark dark:text-light font-medium">/ {product.units}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className={`text-sm font-semibold ${product.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} units left in stock` : "Out of Stock"}
                </p>
              </div>
            </div>

            {/* Actions Area */}
            {!isProducer && (
              <div className="mt-auto space-y-5 pt-6 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-400 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-dark dark:text-light uppercase">Quantity</span>
                  <div className="flex items-center border border-gray-400 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={{ left: "remove" }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="!h-10 !w-10 rounded-none"
                    />
                    <span className="w-12 text-center font-bold text-dark dark:text-light border-x border-gray-400 dark:border-gray-700">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      icon={{ left: "add" }}
                      onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                      disabled={quantity >= product.quantity}
                      className="!h-10 !w-10 rounded-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    label={isAdding ? "Processing..." : "Add to Basket"}
                    variant="outline"
                    icon={{ left: "shopping_cart" }}
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isAdding || product.quantity < 1}
                  />
                  <Button
                    label="Buy"
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      handleAddToCart();
                      if (onBuy) onBuy();
                    }}
                    disabled={product.quantity < 1}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </div>
  );
};

export default ProductDetailView;

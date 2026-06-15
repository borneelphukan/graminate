import React from "react";
import { Button, Icon, Badge } from "@graminate/ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const statusToBadgeType: Record<string, "warning" | "success" | "error" | "default"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  SOLD_OUT: "error",
  ARCHIVED: "default",
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

  const handleCardClick = () => {
    if ((mode === "browse" || mode === "saved") && onView) {
      onView(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-800 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${
        mode === "browse" || mode === "saved"
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
          : ""
      }`}
    >
      <div className="relative h-44 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-5xl transition-transform duration-500 group-hover:scale-110">📦</span>
        )}
        <div className="absolute top-2 left-2">
          <Badge
            label={`📦 ${product.category}`}
            type="default"
            size="sm"
            className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-none font-semibold text-gray-700 dark:text-gray-300"
          />
        </div>
        {mode === "manage" && (
          <>
            <div className="absolute top-2 right-2">
              <Badge
                type={statusToBadgeType[product.status]}
                label={product.status}
                size="sm"
                className="font-semibold shadow-sm"
              />
            </div>
            {product.status === "DRAFT" && (
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="outline"
                  shape="circle"
                  size="icon"
                  icon={{ left: "edit" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit(product);
                  }}
                  title="Edit Listing"
                />
              </div>
            )}
          </>
        )}
        {mode === "browse" && !isProducer && (
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            <Button
              variant={isFav ? "destructive" : "outline"}
              shape="circle"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(product.product_id);
              }}
              icon={{ left: (isFav ? "favorite" : "favorite_border") as any }}
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              className="bg-white/90 backdrop-blur-sm"
            />
            <Button
              variant={isWish ? "primary" : "outline"}
              shape="circle"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleWishlist) onToggleWishlist(product.product_id);
              }}
              icon={{ left: (isWish ? "bookmark" : "bookmark_border") as any }}
              title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
              className="bg-white/90 backdrop-blur-sm"
            />
          </div>
        )}
        {mode === "saved" && (
          <div className="absolute top-2 right-2 flex gap-1.5 z-10">
            <Button
              variant={isFav ? "destructive" : "outline"}
              shape="circle"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(product.product_id);
              }}
              icon={{ left: (isFav ? "favorite" : "favorite_border") as any }}
              title="Toggle Favorite"
              className="bg-white/90 backdrop-blur-sm"
            />
            <Button
              variant={isWish ? "primary" : "outline"}
              shape="circle"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleWishlist) onToggleWishlist(product.product_id);
              }}
              icon={{ left: (isWish ? "bookmark" : "bookmark_border") as any }}
              title="Toggle Wishlist"
              className="bg-white/90 backdrop-blur-sm"
            />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-dark dark:text-light truncate">
          {product.name}
        </h3>
        {product.description && (
          <div className="text-xs text-dark dark:text-light mt-1 line-clamp-2 prose prose-sm prose-neutral dark:prose-invert leading-tight">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <span className="inline" {...props} />,
                h1: ({ node, ...props }) => <strong className="font-bold mr-1 inline" {...props} />,
                h2: ({ node, ...props }) => <strong className="font-bold mr-1 inline" {...props} />,
                h3: ({ node, ...props }) => <strong className="font-bold mr-1 inline" {...props} />,
                ul: ({ node, ...props }) => <span className="inline" {...props} />,
                ol: ({ node, ...props }) => <span className="inline" {...props} />,
                li: ({ node, ...props }) => <span className="inline mr-1 after:content-[',_'] last:after:content-none" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold inline" {...props} />,
                em: ({ node, ...props }) => <em className="italic inline" {...props} />,
              }}
            >
              {product.description}
            </ReactMarkdown>
          </div>
        )}

        {mode === "browse" && (
          <div className="flex items-center gap-1.5 mt-2">
            <Icon type="storefront" className="text-xs! text-dark dark:text-light" />
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
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-dark dark:text-light">
                / {product.units}
              </span>
            </div>
            <p className="text-xs text-dark dark:text-light mt-0.5">
              {product.quantity} available
            </p>
          </div>

          {mode === "browse" && !isProducer && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={{ left: "shopping_cart" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddToCart) onAddToCart(product.product_id);
                }}
                title="Add to Cart"
              />
              <Button
                label="Buy"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBuy) onBuy();
                }}
              />
            </div>
          )}

          {mode === "manage" && (
            <div className="flex gap-1.5">
              {product.status === "DRAFT" && (
                <Button
                  label="Publish"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPublish) onPublish(product.product_id);
                  }}
                />
              )}
              {product.status === "PUBLISHED" && (
                <>
                  <Button
                    label="Edit"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(product);
                    }}
                  />
                  <Button
                    label="Unpublish"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUnpublish) onUnpublish(product.product_id);
                    }}
                  />
                </>
              )}
              {product.status !== "PUBLISHED" && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(product.product_id);
                  }}
                  variant="destructive"
                  size="sm"
                  icon={{ left: "delete" }}
                  title="Delete"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

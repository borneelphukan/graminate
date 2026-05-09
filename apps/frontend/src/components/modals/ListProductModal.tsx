import { Icon, Dropdown, Button, Input, Popup, SegmentedControl, TextArea } from "@graminate/ui";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import { UNITS } from "@/constants/options";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

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
};

const ListProductModal = ({
  isOpen,
  onClose,
  userId,
  onProductAdded,
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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [unitSuggestions, setUnitSuggestions] = useState<string[]>([]);
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const unitSuggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        unitSuggestionsRef.current &&
        !unitSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowUnitSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setUnits("");
      setQuantity("1");
      setErrors({});
      setSelectedInventoryId(null);
      setSource("manual");
      document.body.style.overflow = "hidden";

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
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, userId]);

  useEffect(() => {
    if (selectedInventoryId && source === "inventory") {
      const item = inventoryItems.find(
        (i) => i.inventory_id === selectedInventoryId
      );
      if (item) {
        setName(item.item_name);
        setUnits(item.units);
        setPrice(String(item.price_per_unit));
        setQuantity(String(item.quantity));
      }
    }
  }, [selectedInventoryId, source, inventoryItems]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Price must be greater than 0.";
    if (!units.trim()) newErrors.units = "Units are required.";
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = "Quantity must be at least 1.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUnitChange = (value: string) => {
    setUnits(value);
    if (value.length > 0) {
      setUnitSuggestions(
        UNITS.filter((u) => u.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setUnitSuggestions(UNITS);
    }
    setShowUnitSuggestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userId) return;

    setIsLoading(true);
    try {
      await axiosInstance.post("/marketplace/products/add", {
        user_id: Number(userId),
        inventory_id: source === "inventory" ? selectedInventoryId : undefined,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        price: Number(price),
        units: units.trim(),
        quantity: Number(quantity),
        images: [],
      });
      setPopup({
        isOpen: true,
        title: "Success",
        text: "Product draft created. Click 'Publish' to make it live.",
        variant: "success",
      });
      onProductAdded();
    } catch (error) {
      console.error("Error creating product:", error);
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Failed to create product listing.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              List New Product
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-500 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
              aria-label="Close modal"
            >
              <Icon type="close" className="w-5 h-5" />
            </button>
          </div>

          <SegmentedControl
            className="mb-6 w-full sm:w-fit text-dark dark:text-light"
            defaultValue="first"
            options={{
              first: {
                value: "manual",
                label: "Manual Entry",
                onClick: () => {
                  setSource("manual");
                  setSelectedInventoryId(null);
                  setName("");
                  setPrice("");
                  setUnits("");
                  setQuantity("1");
                },
              },
              second: {
                value: "inventory",
                label: "From Inventory",
                onClick: () => setSource("inventory"),
              },
            }}
          />

          {source === "inventory" && (
            <div className="mb-6">
              {isLoadingInventory ? (
                <div className="flex justify-center py-4">
                  <Loader />
                </div>
              ) : inventoryItems.length === 0 ? (
                <p className="text-sm text-dark dark:text-light">
                  No inventory items found. Use manual entry instead.
                </p>
              ) : (
                <Dropdown
                  label="Select Inventory Item"
                  items={inventoryItems.map(
                    (i) => `${i.item_name} (${i.quantity} ${i.units})`
                  )}
                  selectedItem={
                    selectedInventoryId
                      ? (() => {
                          const item = inventoryItems.find(
                            (i) => i.inventory_id === selectedInventoryId
                          );
                          return item
                            ? `${item.item_name} (${item.quantity} ${item.units})`
                            : "";
                        })()
                      : ""
                  }
                  onSelect={(val) => {
                    const item = inventoryItems.find(
                      (i) => `${i.item_name} (${i.quantity} ${i.units})` === val
                    );
                    if (item) setSelectedInventoryId(item.inventory_id);
                  }}
                  placeholder="Select an item from your inventory"
                />
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="product-name"
                label="Product Name"
                placeholder="e.g., Organic Honey"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                disabled={source === "inventory" && !!selectedInventoryId}
              />
              <Dropdown
                label="Category"
                items={subTypes}
                selectedItem={category}
                onSelect={(val) => setCategory(val)}
                placeholder="Select a category"
              />
            </div>
            {errors.category && (
              <p className="text-red-500 dark:text-red-400 text-xs -mt-4">
                {errors.category}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                id="product-price"
                label="Price (₹)"
                type="number"
                placeholder="e.g., 250.00"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                error={errors.price}
              />
              <Input
                id="product-quantity"
                label="Quantity"
                type="number"
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value.replace(/[^0-9]/g, ""))
                }
                error={errors.quantity}
              />
              <div className="relative">
                <Input
                  id="product-units"
                  label="Unit"
                  placeholder="e.g., kg"
                  value={units}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  onFocus={() => {
                    setUnitSuggestions(
                      units
                        ? UNITS.filter((u) =>
                            u.toLowerCase().includes(units.toLowerCase())
                          )
                        : UNITS
                    );
                    setShowUnitSuggestions(true);
                  }}
                  error={errors.units}
                  disabled={source === "inventory" && !!selectedInventoryId}
                />
                {showUnitSuggestions && unitSuggestions.length > 0 && (
                  <div
                    ref={unitSuggestionsRef}
                    className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-32 overflow-auto"
                  >
                    {unitSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm text-dark dark:text-light cursor-pointer"
                        onClick={() => {
                          setUnits(suggestion);
                          setShowUnitSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <TextArea
              id="product-description"
              label="Description"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />


            {errors.general && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {errors.general}
              </p>
            )}

            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-400 dark:border-gray-600">
              <Button
                label="Cancel"
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              />
              <Button
                label={isLoading ? "Creating..." : "Create Draft"}
                type="submit"
                variant="primary"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => {
          setPopup((prev) => ({ ...prev, isOpen: false }));
          if (popup.variant === "success") onClose();
        }}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </div>
  );
};

export default ListProductModal;

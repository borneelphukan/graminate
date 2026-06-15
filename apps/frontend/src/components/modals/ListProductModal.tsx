import { Icon, Dropdown, Button, Input, Popup, SegmentedControl, TextArea, Upload } from "@graminate/ui";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import { UNITS } from "@/constants/options";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const dataURLtoFile = (dataurl: string, filename: string) => {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    return null;
  }
};

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
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [unitSuggestions, setUnitSuggestions] = useState<string[]>([]);
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const unitSuggestionsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

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
      if (productToEdit) {
        setName(productToEdit.name);
        setDescription(productToEdit.description || "");
        setCategory(productToEdit.category);
        setPrice(String(productToEdit.price));
        setUnits(productToEdit.units);
        setQuantity(String(productToEdit.quantity));
        setErrors({});
        setSelectedInventoryId(productToEdit.inventory_id || null);
        setSource(productToEdit.inventory_id ? "inventory" : "manual");
        if (productToEdit.images && productToEdit.images.length > 0) {
          const mappedFiles = productToEdit.images
            .map((img, i) => dataURLtoFile(img, `Product_Image_${i + 1}`))
            .filter((f): f is File => f !== null);
          setFiles(mappedFiles);
        } else {
          setFiles([]);
        }
      } else {
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setUnits("");
        setQuantity("1");
        setErrors({});
        setSelectedInventoryId(null);
        setSource("manual");
        setFiles([]);
      }
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
  }, [isOpen, userId, productToEdit]);

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

  const formatText = (type: 'bold' | 'italic' | 'list' | 'h') => {
    const el = descriptionRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = description;
    const selectedText = val.substring(start, end);

    let newText = '';
    let newCursorPos = end;

    switch (type) {
      case 'bold':
        newText = val.substring(0, start) + `**${selectedText}**` + val.substring(end);
        newCursorPos = start + (selectedText ? 2 + selectedText.length + 2 : 2);
        break;
      case 'italic':
        newText = val.substring(0, start) + `*${selectedText}*` + val.substring(end);
        newCursorPos = start + (selectedText ? 1 + selectedText.length + 1 : 1);
        break;
      case 'list':
        const prefix = "\n- ";
        newText = val.substring(0, start) + (selectedText ? selectedText.split('\n').map(l => `- ${l}`).join('\n') : prefix) + val.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length + 2 : prefix.length);
        break;
      case 'h':
        newText = val.substring(0, start) + `### ${selectedText}` + val.substring(end);
        newCursorPos = start + (selectedText ? 4 + selectedText.length : 4);
        break;
    }

    setDescription(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userId) return;

    setIsLoading(true);
    try {
      const base64Images = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
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
        setPopup({
          isOpen: true,
          title: "Success",
          text: "Product listing updated successfully.",
          variant: "success",
        });
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
        setPopup({
          isOpen: true,
          title: "Success",
          text: "Product draft created. Click 'Publish' to make it live.",
          variant: "success",
        });
      }
      onProductAdded();
    } catch (error) {
      console.error("Error saving product:", error);
      setPopup({
        isOpen: true,
        title: "Error",
        text: `Failed to ${productToEdit ? "update" : "create"} product listing.`,
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
              {productToEdit ? "Edit Product Listing" : "List New Product"}
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

          {!productToEdit && (
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
          )}

          {!productToEdit && source === "inventory" && (
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark dark:text-light">Product Images</label>
              <Upload
                multiple
                value={files}
                onValueChange={setFiles}
                accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                maxSizeInMB={5}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-dark dark:text-light font-medium text-sm">
                Description
              </label>
              <div className="flex flex-col border border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm focus-within:border-green-200 transition-all">
                <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-400 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                    icon={{ left: 'format_bold' }}
                    onClick={() => formatText('bold')}
                    title="Bold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                    icon={{ left: 'format_italic' }}
                    onClick={() => formatText('italic')}
                    title="Italic"
                  />
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                    icon={{ left: 'format_list_bulleted' }}
                    onClick={() => formatText('list')}
                    title="Bullet List"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                    icon={{ left: 'format_h3' }}
                    onClick={() => formatText('h')}
                    title="Heading"
                  />
                </div>
                <textarea
                  ref={descriptionRef}
                  id="product-description"
                  placeholder="Describe your product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border-none bg-white dark:bg-gray-800 text-dark dark:text-light placeholder-gray-400 focus:outline-none focus:ring-0 text-sm resize-y min-h-[120px]"
                />
              </div>
            </div>


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
                label={isLoading ? "Saving..." : productToEdit ? "Save Changes" : "Create Draft"}
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

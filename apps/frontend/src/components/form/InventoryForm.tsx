import { Dropdown, Icon, Button, Checkbox, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { UNITS } from "@/constants/options";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "../ui/Loader";

interface InventoryFormProps extends SidebarProp {
  warehouseId?: number;
  initialData?: any;
  onSuccess?: () => void;
}

type InventoryItemData = {
  itemName: string;
  itemGroup: string;
  units: string;
  quantity: string;
  pricePerUnit: string;
  minimumLimit: string;
  feed: boolean;
};

type InventoryFormErrors = {
  itemName?: string;
  itemGroup?: string;
  units?: string;
  quantity?: string;
  pricePerUnit?: string;
  minimumLimit?: string;
};

type InventoryItemPayload = {
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  price_per_unit: number;
  warehouse_id: number;
  minimum_limit?: number;
  feed: boolean;
}

const InventoryForm = ({
  onClose,
  formTitle,
  warehouseId,
  initialData,
  onSuccess,
}: InventoryFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [inventoryItem, setInventoryItem] = useState<InventoryItemData>({
    itemName: initialData?.item_name || "",
    itemGroup: initialData?.item_group || "",
    units: initialData?.units || "",
    quantity: initialData?.quantity?.toString() || "",
    pricePerUnit: initialData?.price_per_unit?.toString() || "",
    minimumLimit: initialData?.minimum_limit?.toString() || "",
    feed: !!initialData?.feed,
  });
  const [inventoryErrors, setInventoryErrors] = useState<InventoryFormErrors>(
    {}
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useAnimatePanel(setAnimate);

  const handleCloseAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleClose = useCallback(() => {
    handleCloseAnimation();
  }, [handleCloseAnimation]);

  useClickOutside(panelRef, handleClose);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      if (!parsedUserId) {
        setIsLoadingSubTypes(false);
        setSubTypes([]);
        return;
      }
      setIsLoadingSubTypes(true);
      try {
        const response = await axiosInstance.get(`/user/${parsedUserId}`);
        const user = response.data?.data?.user ?? response.data?.user;
        if (!user) {
          setSubTypes([]);
        } else {
          setSubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
        }
      } catch (error) {
        console.error("Error fetching user sub_types:", error);
        setSubTypes([]);
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    fetchUserSubTypes();
  }, [parsedUserId]);

  const validateForm = (): boolean => {
    const errors: InventoryFormErrors = {};
    let isValid = true;

    if (!inventoryItem.itemName.trim()) {
      errors.itemName = "Item Name is required.";
      isValid = false;
    }
    if (!inventoryItem.itemGroup.trim()) {
      errors.itemGroup = "Item Occupation is required.";
      isValid = false;
    }
    if (!inventoryItem.units) {
      errors.units = "Units are required.";
      isValid = false;
    }
    if (!inventoryItem.quantity.trim()) {
      errors.quantity = "Quantity is required.";
      isValid = false;
    } else if (isNaN(Number(inventoryItem.quantity))) {
      errors.quantity = "Quantity must be a valid number.";
      isValid = false;
    } else if (Number(inventoryItem.quantity) < 0) {
      errors.quantity = "Quantity cannot be negative.";
      isValid = false;
    }

    if (!inventoryItem.pricePerUnit.trim()) {
      errors.pricePerUnit = "Price Per Unit is required.";
      isValid = false;
    } else if (isNaN(Number(inventoryItem.pricePerUnit))) {
      errors.pricePerUnit = "Price Per Unit must be a valid number.";
      isValid = false;
    } else if (Number(inventoryItem.pricePerUnit) < 0) {
      errors.pricePerUnit = "Price Per Unit cannot be negative.";
      isValid = false;
    }

    if (
      inventoryItem.minimumLimit.trim() &&
      isNaN(Number(inventoryItem.minimumLimit))
    ) {
      errors.minimumLimit = "Minimum Limit must be a valid number if provided.";
      isValid = false;
    } else if (
      inventoryItem.minimumLimit.trim() &&
      Number(inventoryItem.minimumLimit) < 0
    ) {
      errors.minimumLimit = "Minimum Limit cannot be negative.";
      isValid = false;
    }

    setInventoryErrors(errors);
    return isValid;
  };

  const handleItemCategoryInputChange = (val: string) => {
    setInventoryItem({ ...inventoryItem, itemGroup: val });
    setInventoryErrors({ ...inventoryErrors, itemGroup: undefined });

    if (val.length > 0) {
      const filtered = subTypes.filter((subType) =>
        subType.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(subTypes);
      setShowSuggestions(true);
    }
  };

  const selectCategorySuggestion = (suggestion: string) => {
    setInventoryItem({ ...inventoryItem, itemGroup: suggestion });
    setInventoryErrors({ ...inventoryErrors, itemGroup: undefined });
    setShowSuggestions(false);
  };

  const handleItemCategoryInputFocus = () => {
    if (subTypes.length > 0) {
      if (!inventoryItem.itemGroup) {
        setSuggestions(subTypes);
      } else {
        const filtered = subTypes.filter((subType) =>
          subType.toLowerCase().includes(inventoryItem.itemGroup.toLowerCase())
        );
        setSuggestions(filtered);
      }
      setShowSuggestions(true);
    }
  };

  const handleSubmitInventoryItem = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!parsedUserId) {
      alert("User ID is missing. Cannot create inventory item.");
      return;
    }
    if (!warehouseId) {
      alert("Warehouse ID is missing. Cannot create inventory item.");
      return;
    }

    const payload: InventoryItemPayload = {
      user_id: Number(parsedUserId),
      item_name: inventoryItem.itemName,
      item_group: inventoryItem.itemGroup,
      units: inventoryItem.units,
      quantity: Number(inventoryItem.quantity),
      price_per_unit: Number(inventoryItem.pricePerUnit),
      warehouse_id: warehouseId,
      feed: inventoryItem.feed,
    };

    if (inventoryItem.minimumLimit.trim()) {
      payload.minimum_limit = Number(inventoryItem.minimumLimit);
    }

    try {
      if (initialData?.inventory_id) {
        await axiosInstance.put(
          `/inventory/update/${initialData.inventory_id}`,
          payload
        );
      } else {
        await axiosInstance.post(`/inventory/add`, payload);
      }

      setInventoryItem({
        itemName: "",
        itemGroup: "",
        units: "",
        quantity: "",
        pricePerUnit: "",
        minimumLimit: "",
        feed: false,
      });
      setInventoryErrors({});
      handleClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      alert("Failed to save inventory item. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[540px] bg-white dark:bg-gray-700 overflow-hidden flex flex-col"
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-400 dark:border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formTitle || "Add New Inventory Item"}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              {initialData ? "Update existing item details." : "Register a new item to your warehouse inventory."}
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 text-dark dark:text-light transition-all"
            onClick={handleClose}
            aria-label="Close panel"
          >
            <Icon type={"close"} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <form
            className="space-y-8"
            onSubmit={handleSubmitInventoryItem}
            noValidate
          >
            {/* Item Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Item Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="itemName"
                  label="Item Name"
                  placeholder="e.g. Premium Arabica Beans"
                  value={inventoryItem.itemName}
                  onChange={(e) => {
                    setInventoryItem({ ...inventoryItem, itemName: e.target.value });
                    setInventoryErrors({
                      ...inventoryErrors,
                      itemName: undefined,
                    });
                  }}
                  error={inventoryErrors.itemName}
                />

                {inventoryItem.itemName.trim().length > 0 && (        
                    <Checkbox
                      id="feedCheckbox"
                      label="Is this item a livestock feed?"
                      checked={inventoryItem.feed}
                      onCheckedChange={(checked: boolean) =>
                        setInventoryItem({
                          ...inventoryItem,
                          feed: checked,
                        })
                      }
                      className="font-medium"
                    />
                )}

                <div className="relative">
                  <Input
                    id="itemGroup"
                    label="Item Category / Occupation"
                    placeholder="e.g. Raw Coffee, Packaging"
                    value={inventoryItem.itemGroup}
                    onChange={(e) => handleItemCategoryInputChange(e.target.value)}
                    onFocus={handleItemCategoryInputFocus}
                    error={inventoryErrors.itemGroup}
                  />
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                      {isLoadingSubTypes ? (
                        <div className="p-4 flex justify-center items-center">
                          <Loader />
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-400 dark:hover:bg-white/5 text-sm cursor-pointer text-gray-900 dark:text-white transition-colors"
                            onClick={() => selectCategorySuggestion(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                          No categories found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Dropdown
                  items={UNITS}
                  selectedItem={inventoryItem.units}
                  onSelect={(value: string) => {
                    setInventoryItem({ ...inventoryItem, units: value });
                    setInventoryErrors({ ...inventoryErrors, units: undefined });
                  }}
                  label="Measurement Units"
                  width="full"
                />
              </div>
            </section>

            {/* Pricing & Stock Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Stock</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="quantity"
                    type="number"
                    label="Current Quantity"
                    placeholder="e.g. 100"
                    value={inventoryItem.quantity}
                    onChange={(e) => {
                      setInventoryItem({ ...inventoryItem, quantity: e.target.value });
                      setInventoryErrors({
                        ...inventoryErrors,
                        quantity: undefined,
                      });
                    }}
                    error={inventoryErrors.quantity}
                  />
                  <Input
                    id="pricePerUnit"
                    type="number"
                    label="Price Per Unit (₹)"
                    placeholder="e.g. 25.50"
                    value={inventoryItem.pricePerUnit}
                    onChange={(e) => {
                      setInventoryItem({ ...inventoryItem, pricePerUnit: e.target.value });
                      setInventoryErrors({
                        ...inventoryErrors,
                        pricePerUnit: undefined,
                      });
                    }}
                    error={inventoryErrors.pricePerUnit}
                  />
                </div>
                <Input
                  id="minimumLimit"
                  type="number"
                  label="Minimum Stock Limit (Alert)"
                  placeholder="e.g. 10"
                  value={inventoryItem.minimumLimit}
                  onChange={(e) => {
                    setInventoryItem({ ...inventoryItem, minimumLimit: e.target.value });
                    setInventoryErrors({
                      ...inventoryErrors,
                      minimumLimit: undefined,
                    });
                  }}
                  error={inventoryErrors.minimumLimit}
                />
              </div>
            </section>
          </form>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleClose}
            className="w-full"
          />
          <Button
            label={initialData ? "Update Item" : "Add to Inventory"}
            variant="primary"
            type="submit"
            onClick={handleSubmitInventoryItem}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;

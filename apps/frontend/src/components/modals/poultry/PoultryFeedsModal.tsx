import { Dropdown, Icon, Button, Input, Popup } from "@graminate/ui";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";

import { UNITS } from "@/constants/options";

type FeedRecord = {
  feed_id?: number;
  feed_date: string;
  feed_given: string;
  amount_given: number | string;
  units: string;
};

type ItemRecord = {
  inventory_id: number;
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  created_at: string;
  price_per_unit: number;
  warehouse_id: number | null;
  minimum_limit?: number;
  status?: string;
  feed?: boolean;
};

type PoultryFeedsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  flockId: number;
  userId: number;
  feedRecordToEdit?: FeedRecord | null;
  onRecordSaved: () => void;
};

const PoultryFeedsModal = ({
  isOpen,
  onClose,
  formTitle,
  flockId,
  userId,
  feedRecordToEdit,
  onRecordSaved,
}: PoultryFeedsModalProps) => {
  const [feedDate, setFeedDate] = useState("");
  const [feedGiven, setFeedGiven] = useState("");
  const [amountGiven, setAmountGiven] = useState<number | string>("");
  const [units, setUnits] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FeedRecord, string>>
  >({});
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

  const [inventoryFeedObjects, setInventoryFeedObjects] = useState<
    ItemRecord[]
  >([]);
  const [loadingInventoryFeedItems, setLoadingInventoryFeedItems] =
    useState(false);

  const resetForm = () => {
    setFeedDate(new Date().toISOString().split("T")[0]);
    setFeedGiven("");
    setAmountGiven("");
    setUnits("");
    setErrors({});
  };

  useEffect(() => {
    const fetchFeedInventoryItems = async () => {
      if (!userId) return;
      setLoadingInventoryFeedItems(true);
      try {
        const response = await axiosInstance.get<{ items: ItemRecord[] }>(
          `/inventory/${userId}`,
          {
            params: {
              item_group: "Poultry",
            },
          }
        );
        const feedItemsFromInventory = response.data.items.filter(
          (item) => item.feed === true
        );
        setInventoryFeedObjects(feedItemsFromInventory);
      } catch (error) {
        console.error("Error fetching feed inventory items:", error);
        setInventoryFeedObjects([]);
      } finally {
        setLoadingInventoryFeedItems(false);
      }
    };

    if (isOpen) {
      fetchFeedInventoryItems();
      if (feedRecordToEdit) {
        setFeedDate(
          feedRecordToEdit.feed_date
            ? new Date(feedRecordToEdit.feed_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setFeedGiven(feedRecordToEdit.feed_given ?? "");
        setAmountGiven(feedRecordToEdit.amount_given?.toString() ?? "");
        setUnits(feedRecordToEdit.units ?? "");
      } else {
        resetForm();
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [feedRecordToEdit, isOpen, userId]);

  const handleFeedGivenSelect = (selectedItemName: string) => {
    setFeedGiven(selectedItemName);
    const selectedItemObject = inventoryFeedObjects.find(
      (item) => item.item_name === selectedItemName
    );
    // Set units from the selected inventory item, but allow manual override
    if (selectedItemObject) {
      setUnits(selectedItemObject.units);
    }
    if (errors.feed_given) {
      setErrors((prev) => ({ ...prev, feed_given: undefined }));
    }
  };

  const handleUnitsSelect = (selectedUnit: string) => {
    setUnits(selectedUnit);
    if (errors.units) {
      setErrors((prev) => ({ ...prev, units: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FeedRecord, string>> = {};
    if (!feedDate) newErrors.feed_date = "Feed date is required";
    if (!feedGiven.trim()) newErrors.feed_given = "Feed name is required";

    const numAmount = Number(amountGiven);
    if (amountGiven === "" || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount_given = "Amount must be a positive number";
    }

    if (!units) {
      newErrors.units = "Unit is required";
    }

    if (!feedRecordToEdit && feedGiven.trim() && numAmount > 0) {
      const selectedItem = inventoryFeedObjects.find(
        (item) => item.item_name === feedGiven
      );
      if (selectedItem && selectedItem.quantity < numAmount) {
        newErrors.amount_given = `Insufficient stock. Available: ${selectedItem.quantity} ${selectedItem.units}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      user_id: userId,
      flock_id: flockId,
      feed_date: feedDate,
      feed_given: feedGiven,
      amount_given: Number(amountGiven),
      units: units,
    };

    try {
      if (feedRecordToEdit && feedRecordToEdit.feed_id) {
        await axiosInstance.put(
          `/poultry-feeds/update/${feedRecordToEdit.feed_id}`,
          payload
        );
        setPopup({
          isOpen: true,
          title: "Success",
          text: "Milk record updated successfully!\n\nRemember to manually adjust inventory if feed item or amount changed.",
          variant: "success",
        });
        onRecordSaved();
        onClose();
      } else {
        await axiosInstance.post("/poultry-feeds/add", payload);

        const selectedInventoryItem = inventoryFeedObjects.find(
          (item) => item.item_name === payload.feed_given
        );

        if (selectedInventoryItem) {
          const newQuantity =
            selectedInventoryItem.quantity - payload.amount_given;
          try {
            await axiosInstance.put(
              `/inventory/update/${selectedInventoryItem.inventory_id}`,
              {
                ...selectedInventoryItem,
                quantity: newQuantity,
              }
            );
            setPopup({
              isOpen: true,
              title: "Success",
              text: "Feed record added and inventory updated!",
              variant: "success",
            });
          } catch (inventoryError: unknown) {
            console.error("Error updating inventory:", inventoryError);
            const errorMessage =
              inventoryError &&
              typeof inventoryError === "object" &&
              "response" in inventoryError
                ? (inventoryError as { response: { data: { message: string } } })
                    .response.data.message
                : inventoryError instanceof Error
                ? inventoryError.message
                : "Unknown error";
            setPopup({
              isOpen: true,
              title: "Partial Success",
              text: `Feed record saved, but failed to update inventory: ${errorMessage}. Please adjust inventory manually.`,
              variant: "warning",
            });
          }
        } else {
          setPopup({
            isOpen: true,
            title: "Feed Saved - Inventory Warning",
            text: "Feed record saved, but the corresponding inventory item was not found for quantity update. Please check inventory.",
            variant: "warning",
          });
        }
        onRecordSaved();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Error saving feed record:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : error instanceof Error
          ? error.message
          : "Failed to save feed record.";
      setPopup({
        isOpen: true,
        title: "Error",
        text: errorMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const dropdownItems = inventoryFeedObjects.map((item) => item.item_name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg max-h-[90vh] my-auto overflow-y-auto p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {formTitle}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon type={"close"} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="feed-date"
            label="Feed Date"
            type="date"
            value={feedDate}
            onChange={(e) => setFeedDate(e.target.value)}
            error={errors.feed_date}
          />

          {loadingInventoryFeedItems ? (
            <div className="flex items-center justify-center h-10">
              <Loader />
              <span className="ml-2 text-sm text-dark dark:text-light">
                Loading feed items...
              </span>
            </div>
          ) : (
            <div>
              <Dropdown
                label="Feed Given"
                items={dropdownItems}
                selectedItem={feedGiven}
                onSelect={handleFeedGivenSelect}
                placeholder="Select a feed"
              />
              {errors.feed_given && (
                <p className="mt-1 text-xs text-red-200">{errors.feed_given}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="amount-given"
              label="Amount Given"
              type="number"
              placeholder="e.g., 10.5"
              value={String(amountGiven)}
              onChange={(e) => setAmountGiven(e.target.value)}
              error={errors.amount_given}
            />
            <div>
              <Dropdown
                label="Unit"
                items={UNITS}
                selectedItem={units}
                onSelect={handleUnitsSelect}
                placeholder="Select unit"
              />
              {errors.units && (
                <p className="mt-1 text-xs text-red-200">{errors.units}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-400 dark:border-gray-600">
            <Button
              label="Cancel"
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            />
            <Button
              label={
                isSubmitting
                  ? "Saving..."
                  : feedRecordToEdit
                  ? "Update Record"
                  : "Add Record"
              }
              type="submit"
              variant="primary"
              disabled={isSubmitting || loadingInventoryFeedItems}
            />
          </div>
        </form>
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

export default PoultryFeedsModal;

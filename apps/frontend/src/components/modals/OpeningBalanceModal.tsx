import { Icon, Button, Input } from "@graminate/ui";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import InfoModal from "./InfoModal";

type OpeningBalanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | number;
  initialValue: number;
  onSuccess: (newValue: number) => void;
};

const OpeningBalanceModal = ({
  isOpen,
  onClose,
  userId,
  initialValue,
  onSuccess,
}: OpeningBalanceModalProps) => {
  const [balance, setBalance] = useState(initialValue.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [infoModalState, setInfoModalState] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant?: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: undefined,
  });

  useEffect(() => {
    if (isOpen) {
      setBalance(initialValue.toString());
      setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance || isNaN(Number(balance))) {
      setError("Please enter a valid amount.");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.put(`/user/${userId}`, {
        opening_balance: Number(balance),
      });
      onSuccess(Number(balance));
      onClose();
    } catch (err: any) {
      console.error("Error updating opening balance:", err);
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: err.response?.data?.message || "Could not update opening balance.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-md mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm p-6 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
              <h3 className="text-xl font-semibold">Set Opening Balance</h3>
              <button
                type="button"
                className="text-dark bg-transparent hover:bg-gray-500 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon type={"close"} className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-dark dark:text-light mb-6">
              Enter the starting cash balance for your business as of the beginning of the analysis period (6 months ago).
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="opening-balance"
                label="Opening Balance (INR)"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                error={error}
              />

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-400 dark:border-gray-600">
                <Button
                  label="Cancel"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                />
                <Button
                  label={isLoading ? "Updating..." : "Update Balance"}
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() => setInfoModalState((prev) => ({ ...prev, isOpen: false }))}
        title={infoModalState.title}
        text={infoModalState.text}
        variant={infoModalState.variant}
      />
    </>
  );
};

export default OpeningBalanceModal;

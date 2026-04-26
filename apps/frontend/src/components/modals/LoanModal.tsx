import { Icon, Button, Input } from "@graminate/ui";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useRouter } from "next/router";
import InfoModal from "./InfoModal";

type LoanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const LoanModal = ({ isOpen, onClose, onSuccess }: LoanModalProps) => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    loan_name: "",
    lender: "",
    amount: "",
    interest_rate: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "Active",
  });

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
      setFormData({
        loan_name: "",
        lender: "",
        amount: "",
        interest_rate: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "Active",
      });
      setErrors({});
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.loan_name.trim()) newErrors.loan_name = "Loan name is required.";
    if (!formData.lender.trim()) newErrors.lender = "Lender is required.";
    if (!formData.amount.trim() || Number(formData.amount) <= 0)
      newErrors.amount = "Loan amount must be greater than 0.";
    if (!formData.interest_rate.trim() || Number(formData.interest_rate) < 0)
      newErrors.interest_rate = "Interest rate must be a valid number.";
    if (!formData.start_date) newErrors.start_date = "Start date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userId) {
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: "User ID is not available.",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post(`/loans/user/${userId}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate),
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error logging loan:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : error instanceof Error
          ? error.message
          : "Could not log loan. Please try again.";
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: errorMessage,
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
        <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
              <h3 className="text-xl text-dark dark:text-light font-semibold">Log New Loan</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-500 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon type={"close"} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="loan-name"
                label="Loan Name"
                placeholder="e.g. Agricultural Expansion Loan"
                value={formData.loan_name}
                onChange={(e) => setFormData({ ...formData, loan_name: e.target.value })}
                error={errors.loan_name}
              />
              <Input
                id="lender"
                label="Lender"
                placeholder="e.g. State Bank of India"
                value={formData.lender}
                onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                error={errors.lender}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="loan-amount"
                  label="Amount (INR)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  error={errors.amount}
                />
                <Input
                  id="interest-rate"
                  label="Interest Rate (%)"
                  type="number"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  placeholder="0.00"
                  error={errors.interest_rate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="loan-start-date"
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  error={errors.start_date}
                />
                <Input
                  id="loan-end-date"
                  label="End Date (Optional)"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-400 dark:border-gray-600">
                <Button
                  label="Cancel"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                />
                <Button
                  label={isLoading ? "Saving..." : "Save Loan"}
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

export default LoanModal;

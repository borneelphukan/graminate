import { Icon, Dropdown, Button } from "@graminate/ui";
import React, { useState, useEffect } from "react";
import TextField from "@/components/ui/TextField";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import InfoModal from "./InfoModal";

type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string | undefined;
  onExpenseAdded: () => void;
};

const EXPENSE_CATEGORIES = {
  "Goods & Services": ["Farm Utilities", "Agricultural Feeds", "Consulting"],
  "Utility Expenses": [
    "Electricity",
    "Labour Salary",
    "Water Supply",
    "Taxes",
    "Others",
  ],
};

const ExpenseModal = ({
  isOpen,
  onClose,
  userId,
  onExpenseAdded,
}: ExpenseModalProps) => {
  const [title, setTitle] = useState("");
  const [dateCreated, setDateCreated] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [occupation, setOccupation] = useState("");
  const [category, setCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(true);

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
    const fetchUserSubTypes = async () => {
      if (!userId) {
        setIsLoadingSubTypes(false);
        setSubTypes([]);
        return;
      }
      setIsLoadingSubTypes(true);
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const user = response.data?.data?.user ?? response.data?.user;
        if (user && user.sub_type) {
          const fetchedSubTypes = Array.isArray(user.sub_type)
            ? user.sub_type
            : typeof user.sub_type === "string"
            ? user.sub_type.replace(/[{}"]/g, "").split(",").filter(Boolean)
            : [];
          setSubTypes(fetchedSubTypes);
        } else {
          setSubTypes([]);
        }
      } catch (error) {
        console.error("Error fetching user sub_types:", error);
        setSubTypes([]);
        setInfoModalState({
          isOpen: true,
          title: "Error",
          text: "Failed to fetch user occupations. Please try again.",
          variant: "error",
        });
      } finally {
        setIsLoadingSubTypes(false);
      }
    };

    if (isOpen) {
      fetchUserSubTypes();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDateCreated(new Date().toISOString().split("T")[0]);
      setOccupation("");
      setCategory("");
      setExpenseAmount("");
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
    if (!title.trim()) newErrors.title = "Expense title is required.";
    if (!dateCreated) newErrors.dateCreated = "Expense date is required.";
    if (!category.trim()) newErrors.category = "Expense category is required.";
    if (!expenseAmount.trim() || Number(expenseAmount) <= 0)
      newErrors.expenseAmount = "Expense amount must be greater than 0.";
    if (!userId) newErrors.general = "User ID is missing.";

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

    const expenseData = {
      user_id: Number(userId),
      title: title.trim(),
      occupation: occupation || undefined,
      category: category.trim(),
      expense: Number(expenseAmount),
      date_created: dateCreated,
    };

    try {
      await axiosInstance.post("/expenses/add", expenseData);
      onExpenseAdded();
      onClose();
    } catch (error: any) {
      console.error("Error adding expense:", error);
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: error.response?.data?.message || "Failed to add expense.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
              <h3 className="text-xl text-dark dark:text-light font-semibold">
                Log New Expense
              </h3>
              <button
                type="button"
                className="text-dark dark:text-light bg-transparent hover:bg-gray-500 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon type={"close"} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                label="Expense Title"
                placeholder="e.g., Purchase of Animal Feed"
                value={title}
                onChange={(val) => setTitle(val)}
                errorMessage={errors.title}
                type={errors.title ? "error" : ""}
                width="large"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Date of Logging Expense"
                  calendar={true}
                  value={dateCreated}
                  onChange={(val) => setDateCreated(val)}
                  errorMessage={errors.dateCreated}
                  type={errors.dateCreated ? "error" : ""}
                  width="large"
                />
                <TextField
                  label="Amount (₹)"
                  number={true}
                  value={expenseAmount}
                  onChange={(val) =>
                    setExpenseAmount(val.replace(/[^0-9.]/g, ""))
                  }
                  errorMessage={errors.expenseAmount}
                  type={errors.expenseAmount ? "error" : ""}
                  width="large"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingSubTypes ? (
                  <div className="flex flex-col">
                    <div className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center h-[42px] bg-gray-50 dark:bg-gray-700">
                      <Loader />
                    </div>
                  </div>
                ) : (
                  <Dropdown
                    direction="up"
                    label="Related Occupation"
                    items={
                      subTypes.length > 0
                        ? subTypes
                        : ["N/A - No occupations found"]
                    }
                    selectedItem={occupation}
                    onSelect={(val) =>
                      setOccupation(
                        val === "N/A - No occupations found" ? "" : val
                      )
                    }
                    placeholder="Select an occupation"
                  />
                )}

                <Dropdown
                  direction="up"
                  label="Expense Category"
                  items={EXPENSE_CATEGORIES}
                  selectedItem={category}
                  onSelect={(val) => setCategory(val)}
                  placeholder="Select a category"
                />
              </div>

              {errors.general && (
                <p className="text-red-500 dark:text-red-400 text-sm">
                  {errors.general}
                </p>
              )}
              {errors.category && (
                <p className="text-red-500 dark:text-red-400 text-sm -mt-4">
                  {errors.category}
                </p>
              )}

              <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-400 dark:border-gray-600">
                <Button
                  label="Cancel"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading || isLoadingSubTypes}
                />
                <Button
                  label={
                    isLoading || isLoadingSubTypes ? "Logging..." : "Log Expense"
                  }
                  type="submit"
                  variant="primary"
                  disabled={isLoading || isLoadingSubTypes}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() =>
          setInfoModalState((prev) => ({ ...prev, isOpen: false }))
        }
        title={infoModalState.title}
        text={infoModalState.text}
        variant={infoModalState.variant}
      />
    </>
  );
};

export default ExpenseModal;

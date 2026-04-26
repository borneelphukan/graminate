import { Dropdown, Button, Input } from "@graminate/ui";
import { useSalaryModalPrefill } from "@/hooks/modals";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useState } from "react";
import { showToast, toastMessage } from "@/stores/toast";

type PaymentData = {
  payment_id: number;
  labour_id: number;
  payment_date: string;
  salary_paid: number;
  bonus: number;
  overtime_pay: number;
  housing_allowance: number;
  travel_allowance: number;
  meal_allowance: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

type SalaryModalProps = {
  labourId: number | string;
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  initialData?: PaymentData;
};

const SalaryModal = ({
  labourId,
  onClose,
  onSuccess,
  editMode = false,
  initialData,
}: SalaryModalProps) => {
  const [paymentDate, setPaymentDate] = useState("");
  const [salaryPaid, setSalaryPaid] = useState("");
  const [bonus, setBonus] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [housingAllowance, setHousingAllowance] = useState("");
  const [travelAllowance, setTravelAllowance] = useState("");
  const [mealAllowance, setMealAllowance] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  useSalaryModalPrefill(editMode, initialData, {
    setPaymentDate,
    setSalaryPaid,
    setBonus,
    setOvertimePay,
    setHousingAllowance,
    setTravelAllowance,
    setMealAllowance,
    setPaymentStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentDate || !salaryPaid) {
      toastMessage.set({
        message: "Payment Date and Salary Paid are required.",
        type: "error",
      });
      showToast.set(true);
      return;
    }

    setLoading(true);

    const parseOrDefault = (value: string) => parseFloat(value) || 0;

    const payload = {
      labour_id: labourId,
      payment_date: paymentDate,
      salary_paid: parseOrDefault(salaryPaid),
      bonus: parseOrDefault(bonus),
      overtime_pay: parseOrDefault(overtimePay),
      housing_allowance: parseOrDefault(housingAllowance),
      travel_allowance: parseOrDefault(travelAllowance),
      meal_allowance: parseOrDefault(mealAllowance),
      payment_status: paymentStatus,
    };

    try {
      if (editMode && initialData) {
        await axiosInstance.put(`/labour_payment/update`, {
          ...payload,
          payment_id: initialData.payment_id,
        });
      } else {
        await axiosInstance.post(`/labour_payment/add`, payload);
      }

      toastMessage.set({
        message: editMode
          ? "Salary updated successfully!"
          : "Salary added successfully!",
        type: "success",
      });
      showToast.set(true);

      onClose();
      onSuccess();
      window.location.reload();
    } catch (error) {
      console.error("Error submitting salary data:", error);
      const errorMessage = "An unexpected error occurred.";
      toastMessage.set({ message: errorMessage, type: "error" });
      showToast.set(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
            <h1 className="text-xl font-semibold">
              {editMode ? "Update Salary" : "Add New Salary"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="payment-date"
                label="Payment Date *"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
              <Input
                id="salary-paid"
                label="Salary to Pay / Paid *"
                type="number"
                value={salaryPaid}
                onChange={(e) => setSalaryPaid(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="bonus"
                label="Bonus"
                type="number"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="0.00"
              />
              <Input
                id="overtime-pay"
                label="Overtime Pay"
                type="number"
                value={overtimePay}
                onChange={(e) => setOvertimePay(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                id="housing-allowance"
                label="Housing Allowance"
                type="number"
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(e.target.value)}
                placeholder="0.00"
              />
              <Input
                id="travel-allowance"
                label="Travel Allowance"
                type="number"
                value={travelAllowance}
                onChange={(e) => setTravelAllowance(e.target.value)}
                placeholder="0.00"
              />
              <Input
                id="meal-allowance"
                label="Meal Allowance"
                type="number"
                value={mealAllowance}
                onChange={(e) => setMealAllowance(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <Dropdown
              items={["Pending", "Paid"]}
              selectedItem={paymentStatus}
              onSelect={setPaymentStatus}
              label="Payment Status"
              width="full"
            />

            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-400 dark:border-gray-600">
              <Button
                label="Cancel"
                variant="secondary"
                onClick={onClose}
                type="button"
                disabled={loading}
              />
              <Button
                label={
                  loading
                    ? editMode
                      ? "Updating..."
                      : "Adding..."
                    : editMode
                    ? "Update Salary"
                    : "Add Salary"
                }
                variant="primary"
                type="submit"
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalaryModal;

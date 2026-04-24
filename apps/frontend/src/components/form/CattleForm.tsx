import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

const CATTLE_TYPES_OPTIONS = ["Cows", "Buffalo", "Goat"];

const CATTLE_PURPOSE_OPTIONS = [
  "Milk Production",
  "Meat Production",
  "Breeding",
  "Ploughing/Transport",
];

export type CattleRearingData = {
  cattle_id?: number;
  user_id: number;
  cattle_name: string;
  cattle_type?: string | null;
  number_of_animals: number;
  purpose?: string | null;
  created_at?: string;
};

interface CattleFormProps extends SidebarProp {
  cattleToEdit?: CattleRearingData | null;
  onCattleUpdateOrAdd?: (updatedOrAddedCattle: CattleRearingData) => void;
}

type CattleFormState = {
  cattle_name: string;
  cattle_type: string;
  number_of_animals: number | string;
  purpose: string;
};

type CattleFormErrors = {
  cattle_name?: string;
  cattle_type?: string;
  number_of_animals?: string;
  purpose?: string;
};

type CattlePayload = {
  user_id: number;
  cattle_name: string;
  number_of_animals: number;
  cattle_type?: string;
  purpose?: string;
}

const CattleForm = ({
  onClose,
  formTitle,
  cattleToEdit,
  onCattleUpdateOrAdd,
}: CattleFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [cattleData, setCattleData] = useState<CattleFormState>({
    cattle_name: "",
    cattle_type: "",
    number_of_animals: "",
    purpose: "",
  });
  const [cattleErrors, setCattleErrors] = useState<CattleFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useEffect(() => {
    if (cattleToEdit) {
      setCattleData({
        cattle_name: cattleToEdit.cattle_name || "",
        cattle_type: cattleToEdit.cattle_type || "",
        number_of_animals:
          cattleToEdit.number_of_animals != null
            ? String(cattleToEdit.number_of_animals)
            : "",
        purpose: cattleToEdit.purpose || "",
      });
    } else {
      setCattleData({
        cattle_name: "",
        cattle_type: "",
        number_of_animals: "",
        purpose: "",
      });
    }
  }, [cattleToEdit]);

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

  const validateForm = (): boolean => {
    const errors: CattleFormErrors = {};
    let isValid = true;

    if (!cattleData.cattle_name.trim()) {
      errors.cattle_name = "Cattle / Herd Name is required.";
      isValid = false;
    }
    if (
      cattleData.number_of_animals === null ||
      cattleData.number_of_animals === undefined ||
      String(cattleData.number_of_animals).trim() === ""
    ) {
      errors.number_of_animals = "Number of animals is required.";
      isValid = false;
    } else if (isNaN(Number(cattleData.number_of_animals))) {
      errors.number_of_animals = "Number of animals must be a valid number.";
      isValid = false;
    } else if (Number(cattleData.number_of_animals) <= 0) {
      errors.number_of_animals = "Number of animals must be greater than 0.";
      isValid = false;
    }
    setCattleErrors(errors);
    return isValid;
  };

  const handleSubmitCattle = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    if (!parsedUserId) {
      alert("User ID is missing.");
      return;
    }

    setIsLoading(true);
    const payload: CattlePayload = {
      cattle_name: cattleData.cattle_name,
      number_of_animals: Number(cattleData.number_of_animals),
      user_id: Number(parsedUserId),
    };

    if (cattleData.cattle_type) payload.cattle_type = cattleData.cattle_type;
    if (cattleData.purpose) payload.purpose = cattleData.purpose;

    try {
      let response;
      if (cattleToEdit && cattleToEdit.cattle_id) {
        response = await axiosInstance.put(
          `/cattle-rearing/update/${cattleToEdit.cattle_id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(`/cattle-rearing/add`, payload);
      }

      if (onCattleUpdateOrAdd) {
        onCattleUpdateOrAdd(response.data);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save cattle data:", error);
      setCattleErrors({
        cattle_name: "Failed to save. Please try again.",
      });
    } finally {
      setIsLoading(false);
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
              {formTitle || (cattleToEdit ? "Edit Cattle Record" : "Add New Cattle Record")}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              {cattleToEdit ? "Update existing cattle details." : "Register new livestock records to your profile."}
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
            onSubmit={handleSubmitCattle}
            noValidate
          >
            {/* Basic Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="cattle_name"
                  label="Cattle / Herd Name"
                  placeholder="e.g. Dairy Herd A, Main Bull"
                  value={cattleData.cattle_name}
                  onChange={(e) => {
                    setCattleData({ ...cattleData, cattle_name: e.target.value });
                    setCattleErrors({ ...cattleErrors, cattle_name: undefined });
                  }}
                  error={cattleErrors.cattle_name}
                />
                
                <Input
                  id="number_of_animals"
                  type="number"
                  label="Number of Animals"
                  placeholder="e.g. 50"
                  value={String(cattleData.number_of_animals)}
                  onChange={(e) => {
                    setCattleData({
                      ...cattleData,
                      number_of_animals: e.target.value,
                    });
                    setCattleErrors({
                      ...cattleErrors,
                      number_of_animals: undefined,
                    });
                  }}
                  error={cattleErrors.number_of_animals}
                />
              </div>
            </section>

            {/* Animal Profile Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Animal Profile</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Dropdown
                    label="Cattle Type"
                    items={CATTLE_TYPES_OPTIONS}
                    selectedItem={cattleData.cattle_type}
                    onSelect={(val: string) => {
                      setCattleData({ ...cattleData, cattle_type: val });
                    }}
                    width="full"
                  />
                  <Dropdown
                    label="Primary Purpose"
                    items={CATTLE_PURPOSE_OPTIONS}
                    selectedItem={cattleData.purpose}
                    onSelect={(val: string) => {
                      setCattleData({ ...cattleData, purpose: val });
                    }}
                    width="full"
                  />
                </div>
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
            disabled={isLoading}
            className="w-full"
          />
          <Button
            label={cattleToEdit ? "Update Record" : "Add Record"}
            variant="primary"
            type="submit"
            onClick={handleSubmitCattle}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CattleForm;

import { Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

export type ApicultureData = {
  apiary_id?: number;
  user_id: number;
  apiary_name: string;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  area?: number | null;
  created_at?: string;
};

interface ApicultureFormProps extends SidebarProp {
  apiaryToEdit?: ApicultureData | null;
  onApiaryUpdateOrAdd?: (updatedOrAddedApiary: ApicultureData) => void;
}

type ApiaryFormState = {
  apiary_name: string;
  area: number | string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

type ApiaryFormErrors = {
  apiary_name?: string;
  area?: string;
};

type ApiaryPayload = {
  user_id: number;
  apiary_name: string;
  area?: number;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
};

const ApicultureForm = ({
  onClose,
  formTitle,
  apiaryToEdit,
  onApiaryUpdateOrAdd,
}: ApicultureFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [apiaryData, setApiaryData] = useState<ApiaryFormState>({
    apiary_name: "",
    area: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [apiaryErrors, setApiaryErrors] = useState<ApiaryFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useEffect(() => {
    if (apiaryToEdit) {
      setApiaryData({
        apiary_name: apiaryToEdit.apiary_name || "",
        area: apiaryToEdit.area != null ? String(apiaryToEdit.area) : "",
        address_line_1: apiaryToEdit.address_line_1 || "",
        address_line_2: apiaryToEdit.address_line_2 || "",
        city: apiaryToEdit.city || "",
        state: apiaryToEdit.state || "",
        postal_code: apiaryToEdit.postal_code || "",
      });
    } else {
      setApiaryData({
        apiary_name: "",
        area: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
      });
    }
  }, [apiaryToEdit]);

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
    const errors: ApiaryFormErrors = {};
    let isValid = true;

    if (!apiaryData.apiary_name.trim()) {
      errors.apiary_name = "Bee Yard Name/Identifier is required.";
      isValid = false;
    }

    if (
      String(apiaryData.area).trim() !== "" &&
      isNaN(Number(apiaryData.area))
    ) {
      errors.area = "Area must be a valid number.";
      isValid = false;
    } else if (Number(apiaryData.area) < 0) {
      errors.area = "Area cannot be negative.";
      isValid = false;
    }

    setApiaryErrors(errors);
    return isValid;
  };

  const handleSubmitApiary = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    if (!parsedUserId) {
      alert("User ID is missing.");
      return;
    }

    setIsLoading(true);
    const payload: ApiaryPayload = {
      apiary_name: apiaryData.apiary_name,
      user_id: Number(parsedUserId),
    };

    if (String(apiaryData.area).trim() !== "") {
      payload.area = Number(apiaryData.area);
    }
    if (apiaryData.address_line_1)
      payload.address_line_1 = apiaryData.address_line_1;
    if (apiaryData.address_line_2)
      payload.address_line_2 = apiaryData.address_line_2;
    if (apiaryData.city) payload.city = apiaryData.city;
    if (apiaryData.state) payload.state = apiaryData.state;
    if (apiaryData.postal_code) payload.postal_code = apiaryData.postal_code;

    try {
      let response;
      if (apiaryToEdit && apiaryToEdit.apiary_id) {
        response = await axiosInstance.put(
          `/apiculture/update/${apiaryToEdit.apiary_id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(`/apiculture/add`, payload);
      }

      if (onApiaryUpdateOrAdd) {
        onApiaryUpdateOrAdd(response.data);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save apiary data:", error);
      setApiaryErrors({
        apiary_name: "Failed to save. Please try again.",
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
              {formTitle ||
                (apiaryToEdit ? "Edit Bee Yard" : "Add New Bee Yard")}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              {apiaryToEdit
                ? "Update existing bee yard details."
                : "Register a new bee yard to your profile."}
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
            onSubmit={handleSubmitApiary}
            noValidate
          >
            {/* Basic Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="apiary-name"
                  label="Bee Yard Name"
                  placeholder="e.g. Main Field Bee Yard"
                  value={apiaryData.apiary_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setApiaryData({ ...apiaryData, apiary_name: val });
                    setApiaryErrors({
                      ...apiaryErrors,
                      apiary_name: undefined,
                    });
                  }}
                  error={apiaryErrors.apiary_name}
                />

                <Input
                  id="area"
                  type="number"
                  label="Area (Optional, in m²)"
                  placeholder="e.g. 150.5"
                  value={String(apiaryData.area)}
                  onChange={(e) => {
                    setApiaryData({ ...apiaryData, area: e.target.value });
                    setApiaryErrors({ ...apiaryErrors, area: undefined });
                  }}
                  error={apiaryErrors.area}
                />
              </div>
            </section>

            {/* Location Details Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Location Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="address-line-1"
                  label="Address Line 1"
                  placeholder="e.g. 123 Bee Lane"
                  value={apiaryData.address_line_1}
                  onChange={(e) => {
                    setApiaryData({
                      ...apiaryData,
                      address_line_1: e.target.value,
                    });
                  }}
                />
                <Input
                  id="address-line-2"
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Ward No."
                  value={apiaryData.address_line_2}
                  onChange={(e) => {
                    setApiaryData({
                      ...apiaryData,
                      address_line_2: e.target.value,
                    });
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="city"
                    label="City"
                    placeholder="e.g. Digboi"
                    value={apiaryData.city}
                    onChange={(e) => {
                      setApiaryData({ ...apiaryData, city: e.target.value });
                    }}
                  />
                  <Input
                    id="state"
                    label="State"
                    placeholder="e.g. Assam"
                    value={apiaryData.state}
                    onChange={(e) => {
                      setApiaryData({ ...apiaryData, state: e.target.value });
                    }}
                  />
                </div>
                <Input
                  id="postal-code"
                  label="Postal Code"
                  placeholder="e.g. 12345"
                  value={apiaryData.postal_code}
                  onChange={(e) => {
                    setApiaryData({
                      ...apiaryData,
                      postal_code: e.target.value,
                    });
                  }}
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
            disabled={isLoading}
            className="w-full"
          />
          <Button
            label={apiaryToEdit ? "Update Bee Yard" : "Add Bee Yard"}
            variant="primary"
            type="submit"
            onClick={handleSubmitApiary}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ApicultureForm;

import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

const FLOWER_TYPES_OPTIONS = ["Loose Flowers", "Cut Flowers"];

const CULTIVATION_METHOD_OPTIONS = [
  "Open Field",
  "Greenhouse",
  "Hydroponics",
  "Net House Cultivation", "Polyhouse Cultivation", "Shade Net Cultivation",
];

export type FloricultureData = {
  flower_id?: number;
  user_id: number;
  flower_name: string;
  flower_type?: string | null;
  area?: number | null;
  method?: string | null;
  planting_date?: string | null;
  created_at?: string;
};

interface FloricultureFormProps extends SidebarProp {
  flowerToEdit?: FloricultureData | null;
  onFlowerUpdateOrAdd?: (updatedOrAddedFlower: FloricultureData) => void;
}

type FloricultureFormState = {
  flower_name: string;
  flower_type: string;
  area: string | number;
  method: string;
  planting_date: string;
};

type FloricultureFormErrors = {
  flower_name?: string;
  flower_type?: string;
  area?: string;
  method?: string;
  planting_date?: string;
};

const FloricultureForm = ({
  onClose,
  formTitle,
  flowerToEdit,
  onFlowerUpdateOrAdd,
}: FloricultureFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [formData, setFormData] = useState<FloricultureFormState>({
    flower_name: "",
    flower_type: "",
    area: "",
    method: "",
    planting_date: "",
  });
  const [errors, setErrors] = useState<FloricultureFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useEffect(() => {
    if (flowerToEdit) {
      setFormData({
        flower_name: flowerToEdit.flower_name || "",
        flower_type: flowerToEdit.flower_type || "",
        area: flowerToEdit.area != null ? String(flowerToEdit.area) : "",
        method: flowerToEdit.method || "",
        planting_date: flowerToEdit.planting_date ? flowerToEdit.planting_date.split('T')[0] : "",
      });
    } else {
      setFormData({
        flower_name: "",
        flower_type: "",
        area: "",
        method: "",
        planting_date: "",
      });
    }
  }, [flowerToEdit]);

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
    const newErrors: FloricultureFormErrors = {};
    let isValid = true;

    if (!formData.flower_name.trim()) {
      newErrors.flower_name = "Flower Name is required.";
      isValid = false;
    }
    
    if (formData.area && isNaN(Number(formData.area))) {
      newErrors.area = "Area must be a valid number.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    if (!parsedUserId) {
      alert("User ID is missing.");
      return;
    }

    setIsLoading(true);
    const payload = {
      ...formData,
      area: formData.area ? Number(formData.area) : null,
      user_id: Number(parsedUserId),
      planting_date: formData.planting_date || null,
    };

    try {
      let response;
      if (flowerToEdit && flowerToEdit.flower_id) {
        response = await axiosInstance.put(
          `/floriculture/update/${flowerToEdit.flower_id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(`/floriculture/add`, payload);
      }

      if (onFlowerUpdateOrAdd) {
        onFlowerUpdateOrAdd(response.data);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save floriculture data:", error);
      setErrors({
        flower_name: "Failed to save. Please try again.",
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
              {formTitle || (flowerToEdit ? "Edit Flower Record" : "Add New Flower Record")}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              {flowerToEdit ? "Update existing flower details." : "Register new flower crop records to your profile."}
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
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="flower_name"
                  label="Flower Name / Variety"
                  placeholder="e.g. Red Roses, Dutch Tulips"
                  value={formData.flower_name}
                  onChange={(e) => {
                    setFormData({ ...formData, flower_name: e.target.value });
                    setErrors({ ...errors, flower_name: undefined });
                  }}
                  error={errors.flower_name}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Dropdown
                    label="Flower Type"
                    items={FLOWER_TYPES_OPTIONS}
                    selectedItem={formData.flower_type}
                    onSelect={(val: string) => {
                      setFormData({ ...formData, flower_type: val });
                    }}
                    width="full"
                  />
                  <Dropdown
                    label="Cultivation Method"
                    items={CULTIVATION_METHOD_OPTIONS}
                    selectedItem={formData.method}
                    onSelect={(val: string) => {
                      setFormData({ ...formData, method: val });
                    }}
                    width="full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="area"
                    type="number"
                    label="Planting Area (sq. ft)"
                    placeholder="e.g. 1500"
                    value={String(formData.area)}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        area: e.target.value,
                      });
                      setErrors({
                        ...errors,
                        area: undefined,
                      });
                    }}
                    error={errors.area}
                  />
                  <Input
                    id="planting_date"
                    type="date"
                    label="Planting Date"
                    value={formData.planting_date}
                    onChange={(e) => {
                      setFormData({ ...formData, planting_date: e.target.value });
                    }}
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full"
          />
          <Button
            label={flowerToEdit ? "Update Record" : "Add Record"}
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FloricultureForm;

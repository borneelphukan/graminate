import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import TextArea from "@/components/ui/TextArea";

export type HiveData = {
  hive_id?: number;
  apiary_id: number;
  hive_name: string;
  hive_type?: string | null;
  bee_species?: string | null;
  installation_date?: string | Date | null;
  honey_capacity?: number | null;
  unit?: string | null;
  ventilation_status?: string | null;
  notes?: string | null;
  last_inspection_date?: string | null;
  queen_status?: string | null;
  brood_pattern?: string | null;
  health_status?: "Issues Detected" | "No Issues" | string;
  symptoms?: string[] | null;
};

export type SavedHiveData = Omit<HiveData, "hive_id"> & { hive_id: number };

type HiveFormState = {
  hive_name: string;
  hive_type: string;
  bee_species: string;
  installation_date: string;
  honey_capacity: string;
  unit: string;
  ventilation_status: string;
  notes: string;
};

interface HiveFormProps extends SidebarProp {
  hiveToEdit?: HiveData | null;
  onHiveUpdateOrAdd: (updatedOrAddedHive: SavedHiveData) => void;
  apiaryId: number;
  apiaryLatitude?: number | null;
  apiaryLongitude?: number | null;
}

const HIVE_CONFIG = {
  "Langstroth Hive": {
    bee_species: [
      "European Honey Bee (Apis mellifera)",
      "Indian Hive Bee (Apis cerana indica)",
    ],
    ventilation_status: [
      "Top Ventilation (Upper Hive Venting)",
      "Bottom Ventilation (Lower Hive Venting)",
      "Entrance Ventilation",
    ],
    unit: ["kilograms (kg)", "pounds (lbs)"],
  },
  "Newton Hive": {
    bee_species: ["Indian Hive Bee (Apis cerana indica)"],
    ventilation_status: [
      "Entrance Ventilation",
      "Bottom Ventilation (Lower Hive Venting)",
    ],
    unit: ["kilograms (kg)"],
  },
  "Jeolikote Hive": {
    bee_species: ["Indian Hive Bee (Apis cerana indica)"],
    ventilation_status: [
      "Entrance Ventilation",
      "Bottom Ventilation (Lower Hive Venting)",
    ],
    unit: ["kilograms (kg)"],
  },
};

const HIVE_TYPES_STRUCTURED = Object.keys(HIVE_CONFIG);

const formatDateForInput = (date: string | Date | undefined | null): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const HiveForm = ({
  onClose,
  formTitle,
  hiveToEdit,
  onHiveUpdateOrAdd,
  apiaryId,
}: HiveFormProps) => {
  const [animate, setAnimate] = useState(false);
  const [hiveData, setHiveData] = useState<HiveFormState>({
    hive_name: "",
    hive_type: "",
    bee_species: "",
    installation_date: "",
    honey_capacity: "",
    unit: "",
    ventilation_status: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ hive_name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useEffect(() => {
    if (hiveToEdit) {
      setHiveData({
        hive_name: hiveToEdit.hive_name || "",
        hive_type: hiveToEdit.hive_type || "",
        bee_species: hiveToEdit.bee_species || "",
        installation_date: formatDateForInput(hiveToEdit.installation_date),
        honey_capacity:
          hiveToEdit.honey_capacity !== null
            ? String(hiveToEdit.honey_capacity)
            : "",
        unit: hiveToEdit.unit || "",
        ventilation_status: hiveToEdit.ventilation_status || "",
        notes: hiveToEdit.notes || "",
      });
    }
  }, [hiveToEdit]);

  const handleClose = useCallback(() => {
    setAnimate(false);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  useClickOutside(panelRef, handleClose);

  const validate = () => {
    const newErrors: { hive_name?: string } = {};
    if (!hiveData.hive_name.trim())
      newErrors.hive_name = "Hive name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const capacity = hiveData.honey_capacity
      ? parseFloat(hiveData.honey_capacity)
      : null;

    const payload = {
      apiary_id: apiaryId,
      hive_name: hiveData.hive_name,
      hive_type: hiveData.hive_type || null,
      bee_species: hiveData.bee_species || null,
      installation_date: hiveData.installation_date || null,
      ventilation_status: hiveData.ventilation_status || null,
      notes: hiveData.notes || null,
      unit: hiveData.unit || null,
      honey_capacity: capacity,
    };

    try {
      const response = hiveToEdit?.hive_id
        ? await axiosInstance.put(
            `/bee-hives/update/${hiveToEdit.hive_id}`,
            payload
          )
        : await axiosInstance.post(`/bee-hives/add`, payload);

      if (onHiveUpdateOrAdd) {
        onHiveUpdateOrAdd(response.data as SavedHiveData);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save hive", error);
      setErrors({ hive_name: "Failed to save hive. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof HiveFormState, value: string) => {
    const newState = { ...hiveData, [field]: value };

    if (field === "hive_type") {
      const config = HIVE_CONFIG[value as keyof typeof HIVE_CONFIG];

      if (config) {
        if (
          newState.bee_species &&
          !config.bee_species.includes(newState.bee_species)
        ) {
          newState.bee_species = "";
        }
        if (
          newState.ventilation_status &&
          !config.ventilation_status.includes(newState.ventilation_status)
        ) {
          newState.ventilation_status = "";
        }
        if (newState.unit && !config.unit.includes(newState.unit)) {
          newState.unit = "";
        }
      } else {
        newState.bee_species = "";
        newState.ventilation_status = "";
        newState.unit = "";
      }
    }

    setHiveData(newState);

    if (errors.hive_name && field === "hive_name") {
      setErrors((prev) => ({ ...prev, hive_name: undefined }));
    }
  };

  const selectedHiveConfig = hiveData.hive_type
    ? HIVE_CONFIG[hiveData.hive_type as keyof typeof HIVE_CONFIG]
    : null;

  const beeSpeciesOptions = selectedHiveConfig
    ? selectedHiveConfig.bee_species
    : [];
  const ventilationOptions = selectedHiveConfig
    ? selectedHiveConfig.ventilation_status
    : [];
  const unitOptions = selectedHiveConfig ? selectedHiveConfig.unit : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-light dark:bg-gray-800 shadow-lg border-l border-gray-400 dark:border-gray-700 overflow-x-hidden"
        style={{
          transform: animate ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        <div className="p-6 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-500 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-dark dark:text-light">
              {formTitle}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-dark dark:text-light dark:hover:text-gray-300 transition-colors"
              aria-label="Close panel"
            >
              <Icon type={"close"} className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar px-1 mt-4">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 flex-grow"
            >
            <Input
              id="hive-name"
              label="Hive Name / Identifier Number"
              placeholder="Enter Hive Name or Identifier"
              value={hiveData.hive_name}
              onChange={(e) => handleInputChange("hive_name", e.target.value)}
              error={errors.hive_name}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                label="Hive Type"
                items={HIVE_TYPES_STRUCTURED}
                selectedItem={hiveData.hive_type}
                onSelect={(val: string) => handleInputChange("hive_type", val)}
                placeholder="Select a Hive Type"
              />
              <Dropdown
                label="Bee Species"
                items={beeSpeciesOptions}
                selectedItem={hiveData.bee_species}
                onSelect={(val: string) =>
                  handleInputChange("bee_species", val)
                }
                placeholder="Select Bee Species"
                isDisabled={!hiveData.hive_type}
              />
            </div>

            <Input
              id="installation-date"
              type="date"
              label="Installation Date"
              value={hiveData.installation_date}
              onChange={(e) => handleInputChange("installation_date", e.target.value)}
            />

            {/* REMOVED latitude and longitude TextFields */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="honey-capacity"
                label="Honey Capacity"
                type="number"
                placeholder="e.g., 25.5"
                value={hiveData.honey_capacity}
                onChange={(e) => handleInputChange("honey_capacity", e.target.value)}
              />
              <Dropdown
                label="Unit"
                items={unitOptions}
                selectedItem={hiveData.unit}
                onSelect={(val: string) => handleInputChange("unit", val)}
                placeholder="Select Unit"
                isDisabled={!hiveData.honey_capacity || !hiveData.hive_type}
              />
            </div>

            <Dropdown
              label="Ventilation Status"
              items={ventilationOptions}
              selectedItem={hiveData.ventilation_status}
              onSelect={(val: string) =>
                handleInputChange("ventilation_status", val)
              }
              placeholder="Select Ventilation Status"
              isDisabled={!hiveData.hive_type}
            />
            <TextArea
              label="Notes (Optional)"
              value={hiveData.notes}
              onChange={(val) => handleInputChange("notes", val)}
            />

              <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                />
                <Button
                  label={hiveToEdit ? "Update Hive" : "Add Hive"}
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                />
              </div>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

export default HiveForm;

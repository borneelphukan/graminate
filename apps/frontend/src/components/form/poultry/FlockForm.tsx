import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import { POULTRY_TYPES, HOUSING_TYPES } from "@/constants/options";
import TextArea from "@/components/ui/TextArea";

type FlockData = {
  flock_id?: number;
  user_id: number;
  flock_name: string;
  flock_type: string;
  quantity: number;
  created_at?: string;
  breed?: string;
  source?: string;
  housing_type?: string;
  notes?: string;
};

interface FlockFormProps extends SidebarProp {
  flockToEdit?: FlockData | null;
  onFlockUpdateOrAdd?: (updatedOrAddedFlock: FlockData) => void;
}

type FlockFormState = {
  flock_name: string;
  flock_type: string;
  quantity: number | string;
  breed: string;
  source: string;
  housing_type: string;
  notes: string;
};

type FlockFormErrors = {
  flock_name?: string;
  flock_type?: string;
  quantity?: string;
  breed?: string;
  source?: string;
  housing_type?: string;
  notes?: string;
};

type FlockPayload = {
  flock_name: string;
  flock_type: string;
  quantity: number;
  user_id: number;
  breed?: string;
  source?: string;
  housing_type?: string;
  notes?: string;
};

const POULTRY_BREEDS_STRUCTURED = {
  Chickens: [
    "White Leghorn (Layer)",
    "Rhode Island Red (Layer)",
    "Gramapriya (Layer)",
    "Cobb 500 (Broiler)",
    "Ross 308 (Broiler)",
    "Hubbard (Broiler)",
    "Vencobb 430Y (Broiler)",
    "Caribro Vishal (Broiler)",
    "Giriraja (Dual-Purpose)",
    "Vanaraja (Dual-Purpose)",
    "Aseel (Breeder)",
    "Kadaknath (Breeder)",
    "Sasso (Breeder)",
    "Kuroiler (Breeder)",
  ],
  Ducks: [
    "Indian Runner (Layer)",
    "Khaki Campbell (Layer)",
    "Pekin (Breeder)",
    "Muscovy (Breeder)",
    "Muscovy (Breeder)",
  ],
  Quails: ["Japanese Quail (Coturnix) (Layer)", "Bobwhite (Breeder)"],
  Turkeys: ["Broad-Breasted White (Breeder)", "Desi Turkey (Breeder)"],
  Geese: ["Emden (Breeder)", "Local Desi Goose (Breeder)"],
  Others: ["Guinea Fowl (Breeder)", "Pigeons (Squab) (Breeder)"],
};

const BREED_CATEGORY_HEADERS: string[] = [];
const ALL_BREED_ITEMS: string[] = [];

Object.entries(POULTRY_BREEDS_STRUCTURED).forEach(([category, breeds]) => {
  const header = `${category}`;
  BREED_CATEGORY_HEADERS.push(header);
  ALL_BREED_ITEMS.push(header);
  ALL_BREED_ITEMS.push(...breeds);
});

const FlockForm = ({
  onClose,
  formTitle,
  flockToEdit,
  onFlockUpdateOrAdd,
}: FlockFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [flockData, setFlockData] = useState<FlockFormState>({
    flock_name: "",
    flock_type: "",
    quantity: "",
    breed: "",
    source: "",
    housing_type: "",
    notes: "",
  });
  const [flockErrors, setFlockErrors] = useState<FlockFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [filteredBreedItems, setFilteredBreedItems] =
    useState<string[]>(ALL_BREED_ITEMS);
  const [filteredBreedCategoryHeaders, setFilteredBreedCategoryHeaders] =
    useState<string[]>(BREED_CATEGORY_HEADERS);

  const panelRef = useRef<HTMLDivElement>(null);
  useAnimatePanel(setAnimate);

  useEffect(() => {
    if (flockToEdit) {
      setFlockData({
        flock_name: flockToEdit.flock_name || "",
        flock_type: flockToEdit.flock_type || "",
        quantity: flockToEdit.quantity || "",
        breed: flockToEdit.breed || "",
        source: flockToEdit.source || "",
        housing_type: flockToEdit.housing_type || "",
        notes: flockToEdit.notes || "",
      });
    } else {
      setFlockData({
        flock_name: "",
        flock_type: "",
        quantity: "",
        breed: "",
        source: "",
        housing_type: "",
        notes: "",
      });
    }
  }, [flockToEdit]);

  useEffect(() => {
    const selectedType = flockData.flock_type;

    const typeToFilterTerm: { [key: string]: string } = {
      Layers: "(Layer)",
      "Dual-Purpose": "(Dual-Purpose)",
      Broilers: "(Broiler)",
      Breeder: "(Breeder)",
    };

    const filterTerm = typeToFilterTerm[selectedType];

    if (!filterTerm) {
      setFilteredBreedItems(ALL_BREED_ITEMS);
      setFilteredBreedCategoryHeaders(BREED_CATEGORY_HEADERS);
      return;
    }

    const newFilteredItems: string[] = [];
    const newFilteredHeaders: string[] = [];

    Object.entries(POULTRY_BREEDS_STRUCTURED).forEach(([category, breeds]) => {
      const matchingBreeds = breeds.filter((breed) =>
        breed.includes(filterTerm)
      );

      if (matchingBreeds.length > 0) {
        newFilteredHeaders.push(category);
        newFilteredItems.push(category, ...matchingBreeds);
      }
    });

    setFilteredBreedItems(newFilteredItems);
    setFilteredBreedCategoryHeaders(newFilteredHeaders);
  }, [flockData.flock_type]);

  const handleCloseAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose]);

  const handleClose = useCallback(() => {
    handleCloseAnimation();
  }, [handleCloseAnimation]);

  useClickOutside(panelRef, handleClose);

  const validateForm = (): boolean => {
    const errors: FlockFormErrors = {};
    let isValid = true;

    if (!flockData.flock_name.trim()) {
      errors.flock_name = "Flock Name is required.";
      isValid = false;
    }
    if (!flockData.flock_type) {
      errors.flock_type = "Flock Type is required.";
      isValid = false;
    }
    if (
      flockData.quantity === null ||
      flockData.quantity === undefined ||
      String(flockData.quantity).trim() === ""
    ) {
      errors.quantity = "Number of birds required.";
      isValid = false;
    } else if (isNaN(Number(flockData.quantity))) {
      errors.quantity = "Number of birds must be a valid number.";
      isValid = false;
    } else if (Number(flockData.quantity) < 0) {
      errors.quantity = "Number of birds cannot be negative.";
      isValid = false;
    }
    setFlockErrors(errors);
    return isValid;
  };

  const handleSubmitFlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!parsedUserId) {
      alert("User ID is missing.");
      return;
    }

    setIsLoading(true);
    const payload: FlockPayload = {
      flock_name: flockData.flock_name,
      flock_type: flockData.flock_type,
      quantity: Number(flockData.quantity),
      user_id: Number(parsedUserId),
    };

    if (flockData.breed.trim()) payload.breed = flockData.breed;
    if (flockData.source.trim()) payload.source = flockData.source;
    if (flockData.housing_type) payload.housing_type = flockData.housing_type;
    if (flockData.notes.trim()) payload.notes = flockData.notes;

    try {
      let response;
      if (flockToEdit && flockToEdit.flock_id) {
        response = await axiosInstance.put(
          `/flock/update/${flockToEdit.flock_id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(`/flock/add`, payload);
      }

      if (onFlockUpdateOrAdd) {
        onFlockUpdateOrAdd(response.data);
      }
      setIsLoading(false);
      handleClose();
    } catch (error) {
      console.error("Error submitting flock:", error);
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
                (flockToEdit ? "Edit Flock Details" : "Add New Flock")}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Manage your poultry batches and production cycles.
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
            id="flock-form"
            className="space-y-8"
            onSubmit={handleSubmitFlock}
            noValidate
          >
            {/* Flock Essentials Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-brand-green rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flock Essentials</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="flock_name"
                  label="Flock Name"
                  placeholder="e.g. Layer Batch 1"
                  value={flockData.flock_name}
                  onChange={(e) => {
                    setFlockData({ ...flockData, flock_name: e.target.value });
                    setFlockErrors({ ...flockErrors, flock_name: undefined });
                  }}
                  error={flockErrors.flock_name}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Dropdown
                    label="Flock Type"
                    items={POULTRY_TYPES}
                    selectedItem={flockData.flock_type}
                    onSelect={(val: string) => {
                      setFlockData({ ...flockData, flock_type: val, breed: "" });
                      setFlockErrors({ ...flockErrors, flock_type: undefined });
                    }}
                    errorMessage={flockErrors.flock_type}
                    width="full"
                  />
                  <Input
                    id="quantity"
                    type="number"
                    label="Quantity"
                    placeholder="e.g. 100"
                    value={String(flockData.quantity)}
                    onChange={(e) => {
                      setFlockData({
                        ...flockData,
                        quantity: e.target.value === "" ? "" : parseInt(e.target.value, 10),
                      });
                      setFlockErrors({ ...flockErrors, quantity: undefined });
                    }}
                    error={flockErrors.quantity}
                    required
                  />
                </div>

                <Dropdown
                  label="Breed"
                  items={filteredBreedItems}
                  selectedItem={flockData.breed}
                  onSelect={(val: string) => {
                    setFlockData({ ...flockData, breed: val });
                  }}
                  placeholder="Select a breed"
                  disabledItems={filteredBreedCategoryHeaders}
                  isDisabled={!flockData.flock_type}
                  width="full"
                />
              </div>
            </section>

            {/* Source & Housing Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Source & Housing</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="source"
                  label="Source (Optional)"
                  placeholder="e.g. Local Hatchery, Self-bred"
                  value={flockData.source}
                  onChange={(e) => {
                    setFlockData({ ...flockData, source: e.target.value });
                  }}
                />
                
                <Dropdown
                  label="Housing Type (Optional)"
                  items={HOUSING_TYPES.map((h) => h.name)}
                  selectedItem={flockData.housing_type}
                  onSelect={(val: string) => {
                    setFlockData({ ...flockData, housing_type: val });
                  }}
                  width="full"
                />

                <TextArea
                  label="Notes (Optional)"
                  placeholder="e.g. Aggression, pecking order, stress indicators"
                  value={flockData.notes}
                  onChange={(val: string) => {
                    setFlockData({ ...flockData, notes: val });
                  }}
                  rows={4}
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
            disabled={isLoading}
          />
          <Button
            label={isLoading ? (flockToEdit ? "Updating..." : "Creating...") : (flockToEdit ? "Update Flock" : "Create Flock")}
            variant="primary"
            type="submit"
            form="flock-form"
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default FlockForm;

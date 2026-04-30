import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const WAREHOUSE_TYPES = [
  "Ambient Storage",
  "Cold Storage",
  "Climate Controlled Storage",
  "Bulk Silo Storage",
  "Packhouse",
  "Hazardous Storage",
];

type WarehouseData = {
  name: string;
  type: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  contact_person: string;
  phone: string;
  category: string;
};

type WarehouseFormErrors = {
  name?: string;
  type?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  category?: string;
};

interface WarehouseFormProps extends SidebarProp {
  initialData?: Partial<WarehouseData>;
  warehouseId?: number;
  onSuccess?: () => void;
}

const WarehouseForm = ({
  onClose,
  formTitle,
  initialData,
  warehouseId,
  onSuccess,
}: WarehouseFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const { subTypes } = useUserPreferences();

  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const cleanValue = (val: any) => {
    const placeholders = ["Unassigned", "N/A", "Not Assigned", "No address provided"];
    if (typeof val === "string" && placeholders.includes(val)) return "";
    return val || "";
  };

  const [warehouseData, setWarehouseData] = useState<WarehouseData>({
    name: cleanValue(initialData?.name),
    type: cleanValue(initialData?.type),
    address_line_1: cleanValue(initialData?.address_line_1),
    address_line_2: cleanValue(initialData?.address_line_2),
    city: cleanValue(initialData?.city),
    state: cleanValue(initialData?.state),
    postal_code: cleanValue(initialData?.postal_code),
    country: cleanValue(initialData?.country),
    contact_person: cleanValue(initialData?.contact_person),
    phone: cleanValue(initialData?.phone),
    category: cleanValue(initialData?.category),
  });
  const [warehouseErrors, setWarehouseErrors] = useState<WarehouseFormErrors>(
    {}
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!warehouseId;

  useAnimatePanel(setAnimate);

  const handleCloseAnimation = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClose = () => {
    handleCloseAnimation();
  };

  useClickOutside(panelRef, handleClose);

  useEffect(() => {
    if (initialData) {
      setWarehouseData({
        name: cleanValue(initialData.name),
        type: cleanValue(initialData.type),
        address_line_1: cleanValue(initialData.address_line_1),
        address_line_2: cleanValue(initialData.address_line_2),
        city: cleanValue(initialData.city),
        state: cleanValue(initialData.state),
        postal_code: cleanValue(initialData.postal_code),
        country: cleanValue(initialData.country),
        contact_person: cleanValue(initialData.contact_person),
        phone: cleanValue(initialData.phone),
        category: cleanValue(initialData.category),
      });
      setWarehouseErrors({});
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: WarehouseFormErrors = {};
    let isValid = true;

    if (!isEditMode) {
      if (!warehouseData.name.trim()) {
        errors.name = "Warehouse Name is required.";
        isValid = false;
      }
      if (!warehouseData.type) {
        errors.type = "Warehouse Type is required.";
        isValid = false;
      }
    }
    


    if (
      warehouseData.phone &&
      !/^\+?[1-9]\d{1,14}$/.test(warehouseData.phone)
    ) {
      errors.phone = "Phone number format is not valid.";
      isValid = false;
    }

    setWarehouseErrors(errors);
    return isValid;
  };

  const handleSubmitWarehouse = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      user_id: parsedUserId ? Number(parsedUserId) : undefined,
      name: warehouseData.name,
      type: warehouseData.type,
      address_line_1: warehouseData.address_line_1 || undefined,
      address_line_2: warehouseData.address_line_2 || undefined,
      city: warehouseData.city || undefined,
      state: warehouseData.state || undefined,
      postal_code: warehouseData.postal_code || undefined,
      country: warehouseData.country || undefined,
      contact_person: warehouseData.contact_person || undefined,
      phone: warehouseData.phone || undefined,
      category: warehouseData.category || undefined,
    };

    try {
      if (isEditMode && warehouseId) {
        await axiosInstance.put(`/warehouse/update/${warehouseId}`, payload);
      } else {
        if (!parsedUserId) {
          alert("User ID is missing. Cannot create warehouse.");
          return;
        }
        await axiosInstance.post(`/warehouse/add`, payload);
      }
      handleClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving warehouse:", error);
      alert("Failed to save warehouse. Please check the console for details.");
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
              {formTitle || (isEditMode ? "Edit Warehouse" : "Create New Warehouse")}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              {isEditMode ? "Modify existing warehouse specifications." : "Register a new storage facility to your network."}
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
            onSubmit={handleSubmitWarehouse}
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
                  id="name"
                  label="Warehouse Name"
                  placeholder="e.g. Main Storage Facility"
                  value={warehouseData.name}
                  onChange={(e) =>
                    setWarehouseData({ ...warehouseData, name: e.target.value })
                  }
                  error={warehouseErrors.name}
                />

                <Dropdown
                  items={WAREHOUSE_TYPES}
                  selectedItem={warehouseData.type}
                  onSelect={(value: string) =>
                    setWarehouseData({ ...warehouseData, type: value })
                  }
                  label="Warehouse Type"
                  width="full"
                />

                <Dropdown
                  items={subTypes}
                  selectedItem={warehouseData.category}
                  onSelect={(value: string) =>
                    setWarehouseData({ ...warehouseData, category: value })
                  }
                  label="Warehouse Category"
                  width="full"
                />
              </div>
            </section>

            {/* Location Details Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="address_line_1"
                  label="Address Line"
                  placeholder="e.g. 123 Industrial Park Rd"
                  value={warehouseData.address_line_1}
                  onChange={(e) =>
                    setWarehouseData({ ...warehouseData, address_line_1: e.target.value })
                  }
                  error={warehouseErrors.address_line_1}
                />

                <Input
                  id="address_line_2"
                  label="Address Line 2 *"
                  placeholder="e.g. Suite 100"
                  value={warehouseData.address_line_2}
                  onChange={(e) =>
                    setWarehouseData({ ...warehouseData, address_line_2: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="city"
                    label="City"
                    placeholder="e.g. Guwahati"
                    value={warehouseData.city}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, city: e.target.value })
                    }
                    error={warehouseErrors.city}
                  />

                  <Input
                    id="state"
                    label="State"
                    placeholder="e.g. Assam"
                    value={warehouseData.state}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, state: e.target.value })
                    }
                    error={warehouseErrors.state}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="postal_code"
                    label="Postal Code"
                    placeholder="e.g. 123456"
                    value={warehouseData.postal_code}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, postal_code: e.target.value })
                    }
                    error={warehouseErrors.postal_code}
                  />
                  <Input
                    id="country"
                    label="Country"
                    placeholder="e.g. India"
                    value={warehouseData.country}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, country: e.target.value })
                    }
                    error={warehouseErrors.country}
                  />
                </div>
              </div>
            </section>

            {/* Contact & Capacity Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="contact_person"
                    label="Contact Person (Optional)"
                    placeholder="e.g. John Doe"
                    value={warehouseData.contact_person}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, contact_person: e.target.value })
                    }
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    placeholder="e.g. +91XXXXXXXXXX"
                    value={warehouseData.phone}
                    onChange={(e) =>
                      setWarehouseData({ ...warehouseData, phone: e.target.value })
                    }
                    error={warehouseErrors.phone}
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
            className="w-full"
          />
          <Button
            label={isEditMode ? "Update Warehouse" : "Create Warehouse"}
            variant="primary"
            type="submit"
            onClick={handleSubmitWarehouse}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default WarehouseForm;

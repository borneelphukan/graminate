import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";

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
  storage_capacity: string;
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
  storage_capacity?: string;
};

interface WarehouseFormProps extends SidebarProp {
  initialData?: Partial<WarehouseData>;
  warehouseId?: number;
}

const WarehouseForm = ({
  onClose,
  formTitle,
  initialData,
  warehouseId,
}: WarehouseFormProps) => {
  const router = useRouter();
  const { user_id: queryUserId } = router.query;
  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;

  const [animate, setAnimate] = useState(false);
  const [warehouseData, setWarehouseData] = useState<WarehouseData>({
    name: initialData?.name || "",
    type: initialData?.type || "",
    address_line_1: initialData?.address_line_1 || "",
    address_line_2: initialData?.address_line_2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postal_code: initialData?.postal_code || "",
    country: initialData?.country || "",
    contact_person: initialData?.contact_person || "",
    phone: initialData?.phone || "",
    storage_capacity: initialData?.storage_capacity?.toString() || "",
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
        name: initialData.name || "",
        type: initialData.type || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postal_code: initialData.postal_code || "",
        country: initialData.country || "",
        contact_person: initialData.contact_person || "",
        phone: initialData.phone || "",
        storage_capacity: initialData.storage_capacity?.toString() || "",
      });
      setWarehouseErrors({});
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: WarehouseFormErrors = {};
    let isValid = true;

    if (!warehouseData.name.trim()) {
      errors.name = "Warehouse Name is required.";
      isValid = false;
    }
    if (!warehouseData.type) {
      errors.type = "Warehouse Type is required.";
      isValid = false;
    }
    if (!warehouseData.address_line_1.trim()) {
      errors.address_line_1 = "Address Line 1 is required.";
      isValid = false;
    }
    if (!warehouseData.city.trim()) {
      errors.city = "City is required.";
      isValid = false;
    }
    if (!warehouseData.state.trim()) {
      errors.state = "State / Province is required.";
      isValid = false;
    }
    if (!warehouseData.postal_code.trim()) {
      errors.postal_code = "Postal Code is required.";
      isValid = false;
    }
    if (!warehouseData.country.trim()) {
      errors.country = "Country is required.";
      isValid = false;
    }
    if (
      warehouseData.storage_capacity &&
      isNaN(parseFloat(warehouseData.storage_capacity))
    ) {
      errors.storage_capacity = "Storage capacity must be a valid number.";
      isValid = false;
    }
    // Basic phone validation
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
      storage_capacity: warehouseData.storage_capacity
        ? parseFloat(warehouseData.storage_capacity)
        : undefined,
    };

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
    window.location.reload();
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
                  label="Address Line 1"
                  placeholder="e.g. 123 Industrial Park Rd"
                  value={warehouseData.address_line_1}
                  onChange={(e) =>
                    setWarehouseData({ ...warehouseData, address_line_1: e.target.value })
                  }
                  error={warehouseErrors.address_line_1}
                />

                <Input
                  id="address_line_2"
                  label="Address Line 2 (Optional)"
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
                    label="State / Province"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Capacity</h3>
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

                <Input
                  id="storage_capacity"
                  type="number"
                  label="Storage Capacity (Numeric)"
                  placeholder="e.g. 10000.50"
                  value={warehouseData.storage_capacity}
                  onChange={(e) =>
                    setWarehouseData({ ...warehouseData, storage_capacity: e.target.value })
                  }
                  error={warehouseErrors.storage_capacity}
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

import { Dropdown, Button, Input, Icon } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import { INDUSTRY_OPTIONS } from "@/constants/options";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";

type CompanyFormProps = {
  userId: string | string[] | undefined;
  onClose: () => void;
};

const isValidE164 = (phone: string) => /^\+?[0-9]{10,15}$/.test(phone);
const companyType = ["Supplier", "Distributor", "Factories", "Buyer"];

const CompanyForm = ({ userId, onClose }: CompanyFormProps) => {
  const [animate, setAnimate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);

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

  const [companyValues, setCompanyValues] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
    type: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    website: "",
    industry: "",
  });
  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({});

  const handleSubmitCompanies = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const requiredFields = [
      "companyName",
      "contactPerson",
      "address_line_1",
      "city",
      "state",
      "postal_code",
    ];
    const missingFields = requiredFields.filter(
      (field) => !companyValues[field as keyof typeof companyValues]?.trim()
    );
    if (missingFields.length > 0) {
      triggerToast(
        `Please fill in required fields: ${missingFields.join(", ")}`,
        "error"
      );
      return;
    }
    if (companyValues.phoneNumber && !isValidE164(companyValues.phoneNumber)) {
      setCompanyErrors({
        ...companyErrors,
        phoneNumber: "Please enter a valid phone number (e.g. +1234567890)",
      });
      triggerToast("Invalid company phone number.", "error");
      return;
    } else {
      setCompanyErrors({ ...companyErrors, phoneNumber: "" });
    }
    if (
      companyValues.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyValues.email)
    ) {
      triggerToast("Please enter a valid email address.", "error");
      return;
    }
    const payload = {
      user_id: Number(userId),
      company_name: companyValues.companyName,
      contact_person: companyValues.contactPerson,
      email: companyValues.email || null,
      phone_number: companyValues.phoneNumber || null,
      type: companyValues.type || null,
      address_line_1: companyValues.address_line_1,
      address_line_2: companyValues.address_line_2 || null,
      city: companyValues.city,
      state: companyValues.state,
      postal_code: companyValues.postal_code,
      website: companyValues.website || null,
      industry: companyValues.industry || null,
    };
    try {
      const response = await axiosInstance.post("/companies/add", payload);
      if (response.status === 201) {
        setCompanyValues({
          companyName: "",
          contactPerson: "",
          email: "",
          phoneNumber: "",
          type: "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          postal_code: "",
          website: "",
          industry: "",
        });
        triggerToast("Company added successfully!", "success");
        onClose();
        window.location.reload();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "An unexpected error occurred";
      triggerToast(`Error: ${message}`, "error");
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
              Create New Company
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Add a new business entity to your CRM network.
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
            onSubmit={handleSubmitCompanies}
            noValidate
          >
            {/* General Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="companyName"
                  label="Company Name"
                  placeholder="Enter company name"
                  value={companyValues.companyName}
                  onChange={(e) =>
                    setCompanyValues({ ...companyValues, companyName: e.target.value })
                  }
                  error={companyErrors.companyName}
                  required
                />
                <Input
                  id="contactPerson"
                  label="Contact Person / Owner"
                  placeholder="e.g. John Doe"
                  value={companyValues.contactPerson}
                  onChange={(e) =>
                    setCompanyValues({ ...companyValues, contactPerson: e.target.value })
                  }
                  error={companyErrors.contactPerson}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="email"
                    type="email"
                    label="Company Email"
                    placeholder="e.g. contact@company.com"
                    value={companyValues.email}
                    onChange={(e) =>
                      setCompanyValues({ ...companyValues, email: e.target.value })
                    }
                    error={companyErrors.email}
                  />
                  <Input
                    id="phoneNumber"
                    label="Company Phone"
                    placeholder="e.g. +91XXXXXXXXXX"
                    value={companyValues.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCompanyValues({ ...companyValues, phoneNumber: val });
                      if (val && !isValidE164(val)) {
                        setCompanyErrors({
                          ...companyErrors,
                          phoneNumber: "Company phone invalid",
                        });
                      } else {
                        setCompanyErrors({ ...companyErrors, phoneNumber: "" });
                      }
                    }}
                    error={companyErrors.phoneNumber}
                  />
                </div>
              </div>
            </section>

            {/* Profile & Industry Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile & Industry</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="website"
                  label="Company Website"
                  placeholder="e.g. https://company.com"
                  value={companyValues.website}
                  onChange={(e) =>
                    setCompanyValues({ ...companyValues, website: e.target.value })
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Dropdown
                    items={INDUSTRY_OPTIONS}
                    selectedItem={companyValues.industry}
                    onSelect={(value: string) =>
                      setCompanyValues({ ...companyValues, industry: value })
                    }
                    label="Industry"
                    width="full"
                  />
                  <Dropdown
                    items={companyType}
                    selectedItem={companyValues.type}
                    onSelect={(value: string) =>
                      setCompanyValues({ ...companyValues, type: value })
                    }
                    label="Company Type"
                    width="full"
                  />
                </div>
              </div>
            </section>

            {/* Location Details Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="address_line_1"
                  label="Address Line 1"
                  placeholder="e.g. Head Office, Tower B"
                  value={companyValues.address_line_1}
                  onChange={(e) =>
                    setCompanyValues({ ...companyValues, address_line_1: e.target.value })
                  }
                  error={companyErrors.address_line_1}
                  required
                />
                <Input
                  id="address_line_2"
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Street Name, Area"
                  value={companyValues.address_line_2}
                  onChange={(e) =>
                    setCompanyValues({ ...companyValues, address_line_2: e.target.value })
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    id="city"
                    label="City"
                    placeholder="e.g. Mumbai"
                    value={companyValues.city}
                    onChange={(e) =>
                      setCompanyValues({ ...companyValues, city: e.target.value })
                    }
                    error={companyErrors.city}
                    required
                  />
                  <Input
                    id="state"
                    label="State"
                    placeholder="e.g. Maharashtra"
                    value={companyValues.state}
                    onChange={(e) =>
                      setCompanyValues({ ...companyValues, state: e.target.value })
                    }
                    error={companyErrors.state}
                    required
                  />
                  <Input
                    id="postal_code"
                    label="Postal Code"
                    placeholder="e.g. 400001"
                    value={companyValues.postal_code}
                    onChange={(e) =>
                      setCompanyValues({ ...companyValues, postal_code: e.target.value })
                    }
                    error={companyErrors.postal_code}
                    required
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
            label="Create Company"
            variant="primary"
            type="submit"
            onClick={handleSubmitCompanies}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;

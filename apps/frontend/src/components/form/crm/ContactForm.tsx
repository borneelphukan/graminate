import React, { useState, useRef, useCallback } from "react";
import { Dropdown, Button, Input, Icon } from "@graminate/ui";
import { CONTACT_TYPES } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";

type ContactFormProps = {
  userId: string | string[] | undefined;
  onClose: () => void;
};

const isValidE164 = (phone: string) => /^\+?[0-9]{10,15}$/.test(phone);

const ContactForm = ({ userId, onClose }: ContactFormProps) => {
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

  const [contactValues, setContactValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    type: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const validateContact = () => {
    const errors = {
      firstName: "",
      type: "",
      address_line_1: "",
      city: "",
      state: "",
      postal_code: "",
      phoneNumber: "",
    };
    let isValid = true;

    if (!contactValues.firstName.trim()) {
      errors.firstName = "First Name is required.";
      isValid = false;
    }
    if (!contactValues.type) {
      errors.type = "Type is required.";
      isValid = false;
    }
    if (!contactValues.address_line_1.trim()) {
      errors.address_line_1 = "Address Line 1 is required.";
      isValid = false;
    }
    if (!contactValues.city.trim()) {
      errors.city = "City is required.";
      isValid = false;
    }
    if (!contactValues.state.trim()) {
      errors.state = "State is required.";
      isValid = false;
    }
    if (!contactValues.postal_code.trim()) {
      errors.postal_code = "Postal Code is required.";
      isValid = false;
    }

    const phoneValid =
      isValidE164(contactValues.phoneNumber) || !contactValues.phoneNumber;
    if (!phoneValid) {
      errors.phoneNumber = "Phone number is not valid";
      isValid = false;
    }

    return { errors, isValid };
  };

  const handleSubmitContacts = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const validation = validateContact();

    setContactErrors({
      ...contactErrors,
      ...validation.errors,
    });

    if (!validation.isValid) {
      triggerToast("Please correct the errors in the form.", "error");
      return;
    }
    const payload = {
      user_id: Number(userId),
      first_name: contactValues.firstName,
      last_name: contactValues.lastName || null,
      email: contactValues.email || null,
      phone_number: contactValues.phoneNumber,
      type: contactValues.type,
      address_line_1: contactValues.address_line_1,
      address_line_2: contactValues.address_line_2 || null,
      city: contactValues.city,
      state: contactValues.state,
      postal_code: contactValues.postal_code,
    };
    try {
      await axiosInstance.post("/contacts/add", payload);
      setContactValues({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        type: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
      });
      setContactErrors({
        firstName: "",
        type: "",
        phoneNumber: "",
        address_line_1: "",
        city: "",
        state: "",
        postal_code: "",
      });
      triggerToast("Contact added successfully!", "success");
      onClose();
      window.location.reload();
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
              Create New Contact
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Add a new personal or professional contact to your database.
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
            onSubmit={handleSubmitContacts}
            noValidate
          >
            {/* Personal Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="firstName"
                    label="First Name"
                    placeholder="e.g. John"
                    value={contactValues.firstName}
                    onChange={(e) =>
                      setContactValues({ ...contactValues, firstName: e.target.value })
                    }
                    error={contactErrors.firstName}
                    required
                  />
                  <Input
                    id="lastName"
                    label="Last Name"
                    placeholder="e.g. Doe"
                    value={contactValues.lastName}
                    onChange={(e) =>
                      setContactValues({ ...contactValues, lastName: e.target.value })
                    }
                  />
                </div>
                <Dropdown
                  items={CONTACT_TYPES}
                  selectedItem={contactValues.type}
                  onSelect={(value: string) =>
                    setContactValues({ ...contactValues, type: value })
                  }
                  errorMessage={contactErrors.type}
                  label="Contact Type"
                  width="full"
                />
              </div>
            </section>

            {/* Contact Details Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="e.g. john.doe@gmail.com"
                  value={contactValues.email}
                  onChange={(e) =>
                    setContactValues({ ...contactValues, email: e.target.value })
                  }
                />
                <Input
                  id="phoneNumber"
                  label="Phone Number"
                  placeholder="e.g. +91XXXXXXXXXX"
                  value={contactValues.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContactValues({ ...contactValues, phoneNumber: val });
                    if (val && !isValidE164(val)) {
                      setContactErrors({
                        ...contactErrors,
                        phoneNumber: "Contact number not valid",
                      });
                    } else {
                      setContactErrors({ ...contactErrors, phoneNumber: "" });
                    }
                  }}
                  error={contactErrors.phoneNumber}
                />
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
                  placeholder="e.g. Flat No. 203, Building C"
                  value={contactValues.address_line_1}
                  onChange={(e) =>
                    setContactValues({ ...contactValues, address_line_1: e.target.value })
                  }
                  error={contactErrors.address_line_1}
                  required
                />
                <Input
                  id="address_line_2"
                  label="Address Line 2 (Optional)"
                  placeholder="e.g. Green View Apartments, 5th Cross"
                  value={contactValues.address_line_2}
                  onChange={(e) =>
                    setContactValues({ ...contactValues, address_line_2: e.target.value })
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    id="city"
                    label="City"
                    placeholder="e.g. Bengaluru"
                    value={contactValues.city}
                    onChange={(e) =>
                      setContactValues({ ...contactValues, city: e.target.value })
                    }
                    error={contactErrors.city}
                    required
                  />
                  <Input
                    id="state"
                    label="State"
                    placeholder="e.g. Karnataka"
                    value={contactValues.state}
                    onChange={(e) =>
                      setContactValues({ ...contactValues, state: e.target.value })
                    }
                    error={contactErrors.state}
                    required
                  />
                  <Input
                    id="postal_code"
                    label="Postal Code"
                    placeholder="e.g. 560076"
                    value={contactValues.postal_code}
                    onChange={(e) =>
                      setContactValues({ ...contactValues, postal_code: e.target.value })
                    }
                    error={contactErrors.postal_code}
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
            label="Create Contact"
            variant="primary"
            type="submit"
            onClick={handleSubmitContacts}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactForm;

import { Dropdown, Icon, Button, Input } from "@graminate/ui";
import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { GENDER } from "@/constants/options";
import { SidebarProp } from "@/types/card-props";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";

const LabourForm = ({ onClose, formTitle }: SidebarProp) => {
  const router = useRouter();
  const { user_id } = router.query;

  const [labourValues, setLabourValues] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    role: "",
    contactNumber: "",
    aadharCardNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    baseSalary: "",
    bonus: "",
    overtimePay: "",
    housingAllowance: "",
    travelAllowance: "",
    mealAllowance: "",
    paymentFrequency: "Monthly",
  });

  const [labourErrors, setLabourErrors] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    role: "",
    contactNumber: "",
    aadharCardNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    baseSalary: "",
  });

  const [animate, setAnimate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);

  useClickOutside(panelRef, () => {
    setAnimate(false);
    setTimeout(() => handleClose(), 300);
  });

  const handleCloseAnimation = () => {
    setAnimate(false);
    setTimeout(() => onClose(), 300);
  };

  const handleClose = () => {
    handleCloseAnimation();
  };

  const isValidE164 = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const validateLabourAddress = () => {
    const errors = {
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
    };
    let isValid = true;

    if (!labourValues.addressLine1.trim()) {
      errors.addressLine1 = "Address Line 1 is required.";
      isValid = false;
    }
    if (!labourValues.city.trim()) {
      errors.city = "City is required.";
      isValid = false;
    }
    if (!labourValues.state.trim()) {
      errors.state = "State is required.";
      isValid = false;
    }
    if (!labourValues.postalCode.trim()) {
      errors.postalCode = "Postal Code is required.";
      isValid = false;
    }

    return { errors, isValid };
  };

  const validateRequiredFields = () => {
    const errors = {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      role: "",
      aadharCardNumber: "",
      contactNumber: "",
    };
    let isValid = true;

    if (!labourValues.fullName.trim()) {
      errors.fullName = "Full Name is required.";
      isValid = false;
    }
    if (!labourValues.dateOfBirth) {
      errors.dateOfBirth = "Date of Birth is required.";
      isValid = false;
    }
    if (!labourValues.gender) {
      errors.gender = "Gender is required.";
      isValid = false;
    }
    if (!labourValues.role.trim()) {
      errors.role = "Role is required.";
      isValid = false;
    }
    if (!labourValues.aadharCardNumber.trim()) {
      errors.aadharCardNumber = "Aadhar Card Number is required.";
      isValid = false;
    }
    if (!labourValues.contactNumber.trim()) {
      errors.contactNumber = "Contact Number is required.";
      isValid = false;
    } else if (!isValidE164(labourValues.contactNumber)) {
      errors.contactNumber = "Phone number format is not valid.";
      isValid = false;
    }

    return { errors, isValid };
  };

  const validateSalaryFields = () => {
    const errors = {
      baseSalary: "",
    };
    let isValid = true;

    if (labourValues.baseSalary && isNaN(Number(labourValues.baseSalary))) {
      errors.baseSalary = "Base salary must be a number";
      isValid = false;
    }

    return { errors, isValid };
  };

  const handleSubmitLabour = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    const addressValidation = validateLabourAddress();
    const salaryValidation = validateSalaryFields();
    const requiredValidation = validateRequiredFields();

    setLabourErrors({
      ...addressValidation.errors,
      ...salaryValidation.errors,
      ...requiredValidation.errors,
    });

    if (
      !addressValidation.isValid ||
      !salaryValidation.isValid ||
      !requiredValidation.isValid
    ) {
      return;
    }


    const payload = {
      user_id: Number(user_id),
      full_name: labourValues.fullName,
      date_of_birth: labourValues.dateOfBirth,
      gender: labourValues.gender,
      role: labourValues.role,
      contact_number: labourValues.contactNumber,
      aadhar_card_number: labourValues.aadharCardNumber,
      address_line_1: labourValues.addressLine1,
      address_line_2: labourValues.addressLine2,
      city: labourValues.city,
      state: labourValues.state,
      postal_code: labourValues.postalCode,
      // Salary fields
      base_salary: labourValues.baseSalary ? parseFloat(labourValues.baseSalary) : 0,
      bonus: labourValues.bonus ? parseFloat(labourValues.bonus) : 0,
      overtime_pay: labourValues.overtimePay ? parseFloat(labourValues.overtimePay) : 0,
      housing_allowance: labourValues.housingAllowance ? parseFloat(labourValues.housingAllowance) : 0,
      travel_allowance: labourValues.travelAllowance ? parseFloat(labourValues.travelAllowance) : 0,
      meal_allowance: labourValues.mealAllowance ? parseFloat(labourValues.mealAllowance) : 0,
      payment_frequency: labourValues.paymentFrequency,
    };

    try {
      await axiosInstance.post(`/labour/add`, payload);
      triggerToast("Employee added successfully!", "success");
      setLabourValues({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        role: "",
        contactNumber: "",
        aadharCardNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        baseSalary: "",
        bonus: "",
        overtimePay: "",
        housingAllowance: "",
        travelAllowance: "",
        mealAllowance: "",
        paymentFrequency: "Monthly",
      });
      setLabourErrors({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        role: "",
        contactNumber: "",
        aadharCardNumber: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        baseSalary: "",
      });
      handleClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to add employee. Please try again.";
      triggerToast(errorMsg, "error");
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
              {formTitle ? formTitle : "Add New Employee"}
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Enter the professional and personal details of the employee.
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
              onSubmit={handleSubmitLabour}
              noValidate
            >
              {/* Personal Information Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Input
                    id="fullName"
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={labourValues.fullName}
                    onChange={(e) =>
                      setLabourValues({ ...labourValues, fullName: e.target.value })
                    }
                    error={labourErrors.fullName}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      id="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                      value={labourValues.dateOfBirth}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, dateOfBirth: e.target.value })
                      }
                      type="date"
                      error={labourErrors.dateOfBirth}
                    />
                    <Input
                      id="role"
                      label="Designation / Role"
                      placeholder="Role of the Employee"
                      value={labourValues.role}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, role: e.target.value })
                      }
                      error={labourErrors.role}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                      <Dropdown
                        items={GENDER}
                        selectedItem={labourValues.gender}
                        onSelect={(value: string) =>
                          setLabourValues({ ...labourValues, gender: value })
                        }
                        label="Gender"
                        width="full"
                      />
                      {labourErrors.gender && (
                        <p className="text-red-500 text-xs mt-1">{labourErrors.gender}</p>
                      )}
                    </div>
                    <Input
                      id="contactNumber"
                      label="Contact Number"
                      placeholder="e.g. +91XXXXXXXXXX"
                      value={labourValues.contactNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLabourValues({ ...labourValues, contactNumber: val });
                        if (val && !isValidE164(val)) {
                          setLabourErrors({
                            ...labourErrors,
                            contactNumber:
                              "Phone number format is not valid",
                          });
                        } else {
                          setLabourErrors({ ...labourErrors, contactNumber: "" });
                        }
                      }}
                      error={labourErrors.contactNumber}
                    />
                  </div>

                  <Input
                    id="aadharCardNumber"
                    label="Aadhar Card Number"
                    placeholder="e.g. XXXX XXXX XXXX"
                    value={labourValues.aadharCardNumber}
                    onChange={(e) =>
                      setLabourValues({ ...labourValues, aadharCardNumber: e.target.value })
                    }
                    error={labourErrors.aadharCardNumber}
                  />
                </div>
              </section>

              {/* Address Section */}
              <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Input
                    id="addressLine1"
                    label="Address Line 1"
                    placeholder="e.g. House No, Street Name"
                    value={labourValues.addressLine1}
                    onChange={(e) =>
                      setLabourValues({ ...labourValues, addressLine1: e.target.value })
                    }
                    error={labourErrors.addressLine1}
                  />
                  <Input
                    id="addressLine2"
                    label="Address Line 2 (Optional)"
                    placeholder="e.g. Landmark, Apartment Name"
                    value={labourValues.addressLine2}
                    onChange={(e) =>
                      setLabourValues({ ...labourValues, addressLine2: e.target.value })
                    }
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Input
                      id="city"
                      label="City"
                      placeholder="e.g. Mumbai"
                      value={labourValues.city}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, city: e.target.value })
                      }
                      error={labourErrors.city}
                    />
                    <Input
                      id="state"
                      label="State"
                      placeholder="e.g. Maharashtra"
                      value={labourValues.state}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, state: e.target.value })
                      }
                      error={labourErrors.state}
                    />
                    <Input
                      id="postalCode"
                      label="Postal Code"
                      placeholder="e.g. 400001"
                      value={labourValues.postalCode}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, postalCode: e.target.value })
                      }
                      error={labourErrors.postalCode}
                    />
                  </div>
                </div>
              </section>

              {/* Salary Information Section */}
              <section className="space-y-6 pt-4 pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Salary Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      id="baseSalary"
                      label="Base Salary (₹)"
                      placeholder="0.00"
                      value={labourValues.baseSalary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLabourValues({ ...labourValues, baseSalary: val });
                        if (val && isNaN(Number(val))) {
                          setLabourErrors({
                            ...labourErrors,
                            baseSalary: "Must be a valid number",
                          });
                        } else {
                          setLabourErrors({ ...labourErrors, baseSalary: "" });
                        }
                      }}
                      error={labourErrors.baseSalary}
                    />
                    <Dropdown
                      items={["Monthly", "Weekly", "Bi-weekly", "Daily"]}
                      selectedItem={labourValues.paymentFrequency}
                      onSelect={(value: string) =>
                        setLabourValues({
                          ...labourValues,
                          paymentFrequency: value,
                        })
                      }
                      label="Payment Frequency"
                      width="full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Input
                      id="bonus"
                      label="Bonus (₹)"
                      placeholder="0.00"
                      value={labourValues.bonus}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, bonus: e.target.value })
                      }
                    />
                    <Input
                      id="overtimePay"
                      label="Overtime (₹)"
                      placeholder="0.00"
                      value={labourValues.overtimePay}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, overtimePay: e.target.value })
                      }
                    />
                    <Input
                      id="housingAllowance"
                      label="Housing (₹)"
                      placeholder="0.00"
                      value={labourValues.housingAllowance}
                      onChange={(e) =>
                        setLabourValues({
                          ...labourValues,
                          housingAllowance: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      id="travelAllowance"
                      label="Travel Allowance (₹)"
                      placeholder="0.00"
                      value={labourValues.travelAllowance}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, travelAllowance: e.target.value })
                      }
                    />
                    <Input
                      id="mealAllowance"
                      label="Meal Allowance (₹)"
                      placeholder="0.00"
                      value={labourValues.mealAllowance}
                      onChange={(e) =>
                        setLabourValues({ ...labourValues, mealAllowance: e.target.value })
                      }
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
              label="Add Employee" 
              variant="primary" 
              type="submit" 
              onClick={handleSubmitLabour}
              className="w-full"
            />
          </div>
      </div>
    </div>
  );
};

export default LabourForm;

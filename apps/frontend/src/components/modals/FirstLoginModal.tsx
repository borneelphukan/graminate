import { Icon, Button, RadioGroup, RadioGroupItem, Input, Dropdown, IconType } from "@graminate/ui";
import React, { useState, useCallback, useEffect, JSX } from "react";
import { triggerToast } from "@/stores/toast";
import BeeIcon from "@/icons/BeeIcon";
import PoultryIcon from "@/icons/PoultryIcon";
import CattleIcon from "@/icons/CattleIcon";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

type Step = "entitySelection" | "businessName" | "address" | "businessType" | "subType";

type FirstLoginModalProps = {
  isOpen: boolean;
  userId: string;
  onSubmit: (
    businessName: string,
    businessType: string,
    subType?: string[],
    addressLine1?: string,
    addressLine2?: string,
    city?: string,
    state?: string,
    postalCode?: string,
    country?: string,
    darkMode?: boolean,
    userType?: string,
    businessSize?: string
  ) => Promise<void>;
  onClose: () => void;
};

const BUSINESS_TYPES = ["Producer", "Seller"];
const AGRICULTURE_TYPES = ["Poultry", "Cattle Rearing", "Apiculture"];

const FirstLoginModal = ({ isOpen, onSubmit, userId }: FirstLoginModalProps) => {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [step, setStep] = useState<Step>("entitySelection");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [userType, setEntityType] = useState("Individual");
  const [businessSize, setBusinessSize] = useState("Small");

  const [isStepMounted, setIsStepMounted] = useState(false);

  useEffect(() => {
    setIsStepMounted(false);
    const timer = setTimeout(() => {
      setIsStepMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [step]);



  const goToNextStep = useCallback(() => {
    if (step === "entitySelection") {
      if (userType === "Individual") {
        setStep("address");
      } else {
        setStep("businessName");
      }
      return;
    }
    if (step === "businessName" && !businessName.trim()) {
      triggerToast("Business Name cannot be blank.", "error");
      return;
    }
    setStep("address");
  }, [businessName, step, userType]);

  const goToPreviousStep = useCallback(() => {
    setStep((prev) => {
      if (prev === "subType") return "businessType";
      if (prev === "businessType") return "address";
      if (prev === "address") return userType === "Individual" ? "entitySelection" : "businessName";
      if (prev === "businessName") return "entitySelection";
      return prev;
    });
  }, [userType]);

  const handleSubmit = useCallback(async (overrides?: { type?: string; subTypes?: string[] }) => {
    setIsLoading(true);
    try {
      await onSubmit(
        businessName.trim() || (userType === "Individual" ? "Individual Account" : ""),
        overrides?.type ?? businessType,
        overrides?.subTypes ?? (selectedSubTypes.length > 0 ? selectedSubTypes : undefined),
        addressLine1.trim(),
        addressLine2.trim(),
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
        isDarkMode,
        userType,
        businessSize
      );
    } catch (error: unknown) {
      console.error("Failed to save details:", error);
      triggerToast("Failed to save details. Please try again later.", "error");
      setIsLoading(false);
    }
  }, [
    businessName,
    businessType,
    onSubmit,
    selectedSubTypes,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDarkMode,
    userType,
    businessSize,
  ]);

  const handleBusinessTypeSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (businessType === "Producer") {
        setStep("subType");
      } else {
        handleSubmit({ type: businessType });
      }
    },
    [businessType, handleSubmit]
  );

  const handleSubTypeSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await handleSubmit({ subTypes: selectedSubTypes });
    },
    [selectedSubTypes, handleSubmit]
  );

  const handleAddressSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (
        !addressLine1.trim() ||
        !city.trim() ||
        !state.trim() ||
        !postalCode.trim() ||
        !country.trim()
      ) {
        triggerToast("Please fill in all required address fields", "error");
        return;
      }
      setStep("businessType");
    },
    [addressLine1, city, state, postalCode, country]
  );

  const { plan } = useUserPreferences();

  const handleSubTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (plan === "FREE" && selectedSubTypes.length >= 1 && !selectedSubTypes.includes(value)) {
        window.open(`/${userId}/pricing`, "_blank");
        return;
      }
      setSelectedSubTypes((prev) => {
        if (prev.includes(value)) {
          return prev.filter((item) => item !== value);
        }
        return [...prev, value];
      });
    },
    [plan, selectedSubTypes, userId]
  );

  if (!isOpen) {
    return null;
  }

  const renderStepContent = () => {
    if (step === "entitySelection") {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToNextStep();
          }}
          noValidate
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-center text-dark transition-all transform duration-500 ease-out">
            Tell us about yourself
          </h2>
          <p className="text-sm text-center text-dark mb-8 transition-all transform duration-500 ease-out delay-100">
            Step 1 of {userType === "Individual" ? 4 : 5}
          </p>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-dark mb-4 font-semibold text-center">
                Are you an Individual or a Business?
              </label>
              <div className="flex p-1 bg-gray-50 rounded-2xl w-full max-w-md mx-auto border border-gray-400">
                <button
                  type="button"
                  onClick={() => setEntityType("Individual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    userType === "Individual"
                      ? "bg-white text-green-100 shadow-md transform scale-[1.02]"
                      : "text-gray-200"
                  }`}
                >
                  <Icon type="person" size="base" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setEntityType("Business")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    userType === "Business"
                      ? "bg-white text-green-100 shadow-md transform scale-[1.02]"
                      : "text-gray-200"
                  }`}
                >
                  <Icon type="corporate_fare" size="base" />
                  Business
                </button>
              </div>
            </div>

            {userType === "Business" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-dark mb-3 font-semibold">
                  Business Size
                </label>
                <RadioGroup
                  value={businessSize}
                  onValueChange={setBusinessSize}
                  className="grid grid-cols-1 gap-3"
                >
                  {[
                    { id: "Small", label: "Small (max. 5)", desc: "Up to 5 employees" },
                    { id: "Medium", label: "Medium (max 10)", desc: "Up to 10 employees" },
                    { id: "Large", label: "Large (20+)", desc: "20 or more employees" },
                  ].map((size) => (
                    <label
                      key={size.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        businessSize === size.id
                          ? "bg-light border-green-200 shadow-sm text-dark"
                          : "border-gray-300 text-dark hover:border-green-200"
                      }`}
                    >
                      <RadioGroupItem value={size.id} id={`size-${size.id}`} className="sr-only" />
                      <div className="flex flex-col">
                        <span className="font-semibold">{size.label}</span>
                        <span className="text-xs opacity-70">{size.desc}</span>
                      </div>
                      {businessSize === size.id && <Icon type="check_circle" className="text-green-100" />}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-10 transition-all transform duration-500 ease-out delay-300">
            <Button label="Next" variant="primary" type="submit" />
          </div>
        </form>
      );
    }

    if (step === "businessName") {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToNextStep();
          }}
          noValidate
        >
          <h2
            className={`text-2xl sm:text-3xl font-semibold mb-2 text-center text-dark
                transition-all transform duration-500 ease-out
                ${
                  isStepMounted
                    ? "opacity-100 translate-y-0 "
                    : "opacity-0 -translate-y-4 "
                }`}
          >
            Welcome! Let&apos;s set up your business.
          </h2>
          <p
            className={`text-sm text-center text-dark  mb-8
                        transition-all transform duration-500 ease-out delay-100
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Step 2 of 5
          </p>
          <div
            className={`mb-6
                        transition-all transform duration-500 ease-out delay-200
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            <Input
              id="businessName"
              label="What is your Business Name?"
              placeholder="e.g. Graminate Agrosoft Ltd."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <div className="mt-8">
              <label className="block text-sm font-medium text-dark mb-3 font-semibold">
                Select Your Theme Preference
              </label>
              <RadioGroup
                value={isDarkMode ? "dark" : "light"}
                onValueChange={(val) => setIsDarkMode(val === "dark")}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { id: "light", label: "Light Mode", icon: "sunny" },
                  { id: "dark", label: "Dark Mode", icon: "bedtime" },
                ].map((theme) => {
                  const isSelected = (isDarkMode ? "dark" : "light") === theme.id;
                  return (
                    <label
                      key={theme.id}
                      className={`relative flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                                ${
                                  isSelected
                                    ? "bg-green-400 border-green-200 shadow-sm text-dark"
                                    : "border-gray-300 dark:border-gray-400 hover:bg-gray-50/5 dark:hover:bg-gray-500/5 hover:border-green-200 dark:hover:border-green-100"
                                }`}
                    >
                      <RadioGroupItem
                        value={theme.id}
                        id={`theme-${theme.id}`}
                        className="sr-only"
                      />
                      <Icon
                        type={theme.icon as IconType}
                        className={`size-6 mb-2 ${
                          isSelected
                            ? "text-brand-mute-green"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? "text-brand-mute-green font-bold"
                            : "text-dark dark:text-light"
                        }`}
                      >
                        {theme.label}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
          <div
            className={`flex justify-end mt-10 
                        transition-all transform duration-500 ease-out delay-300
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            <Button
              label="Next"
              variant="primary"
              type="submit"
              disabled={!businessName.trim()}
            />
          </div>
        </form>
      );
    }

    if (step === "address") {
      return (
        <form onSubmit={handleAddressSubmit} noValidate>
          <h2
            className={`text-2xl sm:text-3xl font-semibold mb-2 text-center text-dark
                        transition-all transform duration-500 ease-out
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            {userType === "Individual" ? "Enter your Address" : "Enter Your Business Address"}
          </h2>
          <p
            className={`text-sm text-center text-dark mb-6
                        transition-all transform duration-500 ease-out delay-100
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Step {userType === "Individual" ? 2 : 3} of {userType === "Individual" ? 4 : 5}
          </p>
          <div
            className={`space-y-4 mb-6
                        transition-all transform duration-500 ease-out delay-200
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            <Input
              id="addressLine1"
              label="Address Line 1"
              placeholder="Street address, P.O. box, company name"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
            <Input
              id="addressLine2"
              label="Address Line 2"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                placeholder="e.g. Guwahati"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                id="state"
                label="State"
                placeholder="e.g. Assam"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="postalCode"
                label="Postal Code"
                placeholder="e.g. 781001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
              <Dropdown
                label="Country*"
                items={["India"]}
                selectedItem={country}
                onSelect={(val) => setCountry(val)}
                width="full"
              />
            </div>
          </div>
          <div
            className={`flex justify-between items-center mt-10
                        transition-all transform duration-500 ease-out 
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
          >
            <Button
              label="Back"
              variant="secondary"
              onClick={goToPreviousStep}
              type="button"
              disabled={isLoading}
            />
            <Button
              label="Next"
              variant="primary"
              type="submit"
              disabled={
                isLoading ||
                !addressLine1.trim() ||
                !city.trim() ||
                !state.trim() ||
                !postalCode.trim() ||
                !country.trim()
              }
            />
          </div>
        </form>
      );
    }

    if (step === "businessType") {
      return (
        <form onSubmit={handleBusinessTypeSubmit} noValidate>
          <h2
            className={`text-2xl sm:text-3xl font-semibold mb-2 text-center text-dark
                        transition-all transform duration-500 ease-out
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Select Your Business Type
          </h2>
          <p
            className={`text-sm text-center text-dark mb-6
                        transition-all transform duration-500 ease-out delay-100
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Step {userType === "Individual" ? 3 : 4} of {userType === "Individual" ? 4 : 5}
          </p>
          <div
            className={`mb-6
                        transition-all transform duration-500 ease-out delay-200
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            <h3 className="block text-lg font-medium text-dark mb-3">
              Choose Business Type
            </h3>
            <p className="text-sm text-red-100 dark:text-red-300 mb-4 p-3 bg-red-400/20 dark:bg-red-200/10 rounded-lg border border-red-200/50 dark:border-red-200/30">
              This choice is permanent for this account. To select a different
              business type, a new account will be required.
            </p>
            <RadioGroup
              value={businessType}
              onValueChange={setBusinessType}
              className="space-y-3 mt-4"
            >
              {BUSINESS_TYPES.map((type, index) => {
                const isSelected = businessType === type;
                return (
                  <label
                    key={type}
                    className={`relative group flex items-center space-x-3 p-4 border rounded-xl
                                transition-all duration-200 ease-in-out 
                                cursor-pointer hover:border-green-200 dark:hover:border-green-100
                                ${
                                  isSelected
                                    ? "text-green-200 shadow-sm border-green-200"
                                    : "hover:bg-gray-500 dark:hover:bg-gray-500/5"
                                }
                                transition-opacity transform duration-300 ease-out
                                ${
                                  isStepMounted
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 translate-x-5"
                                }`}
                    style={{
                      transitionDelay: isStepMounted
                        ? `${index * 75 + 250}ms`
                        : "0ms",
                    }}
                  >
                    <RadioGroupItem
                      id={`business-type-${type}`}
                      value={type}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isSelected
                          ? "text-brand-mute-green dark:text-brand-green font-bold"
                          : "text-dark dark:text-light"
                      }`}
                    >
                      {type}
                    </span>
                    {isSelected && (
                      <Icon
                        type="check_circle"
                        className="ml-auto text-brand-green animate-in zoom-in duration-300"
                      />
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          </div>
          <div
            className={`flex justify-between items-center mt-10
                        transition-all transform duration-500 ease-out 
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
            style={{
              transitionDelay: isStepMounted
                ? `${BUSINESS_TYPES.length * 75 + 300}ms`
                : "0ms",
            }}
          >
            <Button
              label="Back"
              variant="secondary"
              onClick={goToPreviousStep}
              type="button"
              disabled={isLoading}
            />
            <Button
              label={
                businessType === "Producer"
                  ? "Next"
                  : "Get Started"
              }
              variant="primary"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || businessType === "Wholesaler"}
            />
          </div>
        </form>
      );
    }

    if (step === "subType") {
      const AgricultureIcons: Record<string, JSX.Element> = {
        Poultry: <PoultryIcon />,
        "Cattle Rearing": <CattleIcon />,
        Apiculture: <BeeIcon />,
      };
      return (
        <form onSubmit={handleSubTypeSubmit} noValidate>
          <h2
            className={`text-2xl sm:text-3xl font-semibold mb-2 text-center text-dark
                        transition-all transform duration-500 ease-out
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Choose Your Type of Agriculture
          </h2>
          <p
            className={`text-sm text-center text-dark mb-8
                        transition-all transform duration-500 ease-out delay-100
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            Step {userType === "Individual" ? 4 : 5} of {userType === "Individual" ? 4 : 5}
          </p>
          <fieldset
            className={`mb-6
                        transition-all transform duration-500 ease-out delay-200
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                        }`}
          >
            <legend className="block text-lg font-medium text-dark mb-4">
              Select one or more options:
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {AGRICULTURE_TYPES.map((option, index) => {
                const isPaidLocked = plan === "FREE" && selectedSubTypes.length > 0 && !selectedSubTypes.includes(option);
                return (
                <label
                  key={option}
                  htmlFor={`subtype-${option}`}
                  className={`relative flex flex-col items-center justify-center text-center p-4 border-1 rounded-xl cursor-pointer overflow-hidden
                              transition-all duration-200 ease-in-out group
                              hover:border-green-200 dark:hover:border-green-100
                             
                              ${
                                selectedSubTypes.includes(option)
                                  ? "bg-green-400 dark:bg-green-100/30 border-green-200 dark:border-green-100 shadow-lg"
                                  : "bg-light dark:bg-gray-700 border-gray-300 dark:border-gray-300 hover:bg-gray-400/10 dark:hover:bg-gray-500/10"
                              }
                              transition-opacity transform duration-300 ease-out
                              ${
                                isStepMounted
                                  ? "opacity-100 translate-x-0"
                                  : "opacity-0 translate-x-5"
                              }`}
                  style={{
                    transitionDelay: isStepMounted
                      ? `${index * 75 + 250}ms`
                      : "0ms",
                  }}
                >
                  <input
                    type="checkbox"
                    id={`subtype-${option}`}
                    name="subType"
                    value={option}
                    checked={selectedSubTypes.includes(option)}
                    onChange={handleSubTypeChange}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 h-10 mb-3 flex items-center justify-center text-3xl
                                 transition-colors duration-200 
                                 ${
                                   selectedSubTypes.includes(option)
                                     ? "text-green-100 dark:text-green-300"
                                     : `text-gray-400 dark:text-gray-300 ${!isPaidLocked ? "group-hover:text-green-200 dark:group-hover:text-green-200 peer-focus:text-green-200 dark:peer-focus:text-green-200" : ""}`
                                 }`}
                  >
                    {AgricultureIcons[option]}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      selectedSubTypes.includes(option)
                        ? "text-green-100 dark:text-green-300"
                        : `text-dark dark:text-light ${!isPaidLocked ? "group-hover:text-green-200 dark:group-hover:text-green-200 peer-focus:text-green-100 dark:peer-focus:text-green-200" : ""}`
                    }`}
                  >
                    {option}
                  </span>

                  {isPaidLocked && (
                    <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden">
                      <div className="absolute top-3 -right-6 w-24 py-1 bg-green-100 text-[10px] font-bold text-white text-center transform rotate-45 shadow-sm">
                        PAID
                      </div>
                    </div>
                  )}
                </label>
              );
            })}
            </div>
          </fieldset>
          <div
            className={`flex justify-between items-center mt-10
                        transition-all transform duration-500 ease-out 
                        ${
                          isStepMounted
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
            style={{
              transitionDelay: isStepMounted
                ? `${AGRICULTURE_TYPES.length * 75 + 300}ms`
                : "0ms",
            }}
          >
            <Button
              label="Back"
              variant="secondary"
              onClick={goToPreviousStep}
              type="button"
              disabled={isLoading}
            />
            <Button
              label="Get Started"
              variant="primary"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || selectedSubTypes.length === 0}
            />
          </div>
        </form>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
    >
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400/20 shadow-sm p-6 sm:p-8 w-full relative transition-all duration-300 ease-out overflow-hidden">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default FirstLoginModal;

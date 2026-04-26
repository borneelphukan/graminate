import { Dropdown, Button, Icon, Input } from "@graminate/ui";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { CONTRACT_STATUS } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";

type ContractFormProps = {
  userId: string | string[] | undefined;
  onClose: () => void;
};

type Company = {
  company_id: number;
  user_id: number;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  created_at: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  website?: string;
  industry?: string;
};

const ContractForm = ({ userId, onClose }: ContractFormProps) => {
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

  const [contractsValues, setContractsValues] = useState({
    dealName: "",
    dealPartner: "",
    amountPaid: "",
    status: "",
    contractStartDate: "",
    contractEndDate: "",
    category: "",
    priority: "Medium",
  });

  const [categorySubTypes, setCategorySubTypes] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const categorySuggestionsRef = useRef<HTMLDivElement>(null);

  const [companyNamesList, setCompanyNamesList] = useState<string[]>([]);
  const [dealPartnerSuggestions, setDealPartnerSuggestions] = useState<
    string[]
  >([]);
  const [showDealPartnerSuggestions, setShowDealPartnerSuggestions] =
    useState(false);
  const dealPartnerSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categorySuggestionsRef.current &&
        !categorySuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowCategorySuggestions(false);
      }
      if (
        dealPartnerSuggestionsRef.current &&
        !dealPartnerSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowDealPartnerSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUserSubTypes = async () => {
      const response = await axiosInstance.get(`/user/${userId}`);
      const user = response.data?.data?.user ?? response.data?.user;
      if (!user) throw new Error("User payload missing");
      setCategorySubTypes(Array.isArray(user.sub_type) ? user.sub_type : []);
    };
    if (userId) {
      fetchUserSubTypes();
    }
  }, [userId]);

  useEffect(() => {
    const fetchCompanyNames = async () => {
      if (!userId) return;
      const response = await axiosInstance.get<{ companies: Company[] }>(
        `/companies/${userId}`
      );
      const names =
        response.data?.companies?.map((company) => company.company_name) || [];
      setCompanyNamesList(names);
    };
    fetchCompanyNames();
  }, [userId]);

  const handleCategoryInputChange = (val: string) => {
    setContractsValues({ ...contractsValues, category: val });
    if (val.length > 0) {
      const filtered = categorySubTypes.filter((subType) =>
        subType.toLowerCase().includes(val.toLowerCase())
      );
      setCategorySuggestions(filtered);
      setShowCategorySuggestions(true);
    } else {
      setCategorySuggestions(categorySubTypes);
      setShowCategorySuggestions(true);
    }
  };

  const selectCategorySuggestion = (suggestion: string) => {
    setContractsValues({ ...contractsValues, category: suggestion });
    setShowCategorySuggestions(false);
  };

  const handleCategoryInputFocus = () => {
    if (categorySubTypes.length > 0) {
      setCategorySuggestions(categorySubTypes);
      setShowCategorySuggestions(true);
    }
  };

  const handleDealPartnerInputChange = (val: string) => {
    setContractsValues({ ...contractsValues, dealPartner: val });
    if (val.length > 0 && companyNamesList.length > 0) {
      const filtered = companyNamesList.filter((name) =>
        name.toLowerCase().includes(val.toLowerCase())
      );
      setDealPartnerSuggestions(filtered);
      setShowDealPartnerSuggestions(filtered.length > 0);
    } else {
      setDealPartnerSuggestions([]);
      setShowDealPartnerSuggestions(false);
    }
  };

  const selectDealPartnerSuggestion = (suggestion: string) => {
    setContractsValues({ ...contractsValues, dealPartner: suggestion });
    setShowDealPartnerSuggestions(false);
  };

  const handleDealPartnerInputFocus = () => {
    const currentPartnerValue = contractsValues.dealPartner;
    if (currentPartnerValue.length > 0 && companyNamesList.length > 0) {
      const filtered = companyNamesList.filter((name) =>
        name.toLowerCase().includes(currentPartnerValue.toLowerCase())
      );
      setDealPartnerSuggestions(filtered);
      setShowDealPartnerSuggestions(filtered.length > 0);
    } else {
      setShowDealPartnerSuggestions(false);
    }
  };

  const handleSubmitContracts = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (
      !contractsValues.dealName ||
      !contractsValues.status ||
      !contractsValues.amountPaid
    ) {
      triggerToast("Please fill in Contract Name, Stage, and Amount.", "error");
      return;
    }

    if (!contractsValues.contractStartDate) {
      triggerToast("Start Date is required.", "error");
      return;
    }

    const payload = {
      user_id: Number(userId),
      deal_name: contractsValues.dealName,
      partner: contractsValues.dealPartner,
      amount: parseFloat(contractsValues.amountPaid),
      stage: contractsValues.status,
      start_date: contractsValues.contractStartDate,
      end_date: contractsValues.contractEndDate || null,
      category: contractsValues.category || null,
      priority: contractsValues.priority,
    };
    try {
      await axiosInstance.post("/contracts/add", payload);
      setContractsValues({
        dealName: "",
        dealPartner: "",
        amountPaid: "",
        status: "",
        contractStartDate: "",
        contractEndDate: "",
        category: "",
        priority: "Medium",
      });
      triggerToast("Contract added successfully!", "success");
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
              Create New Contract
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              Document a new deal or partnership in your CRM.
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
            onSubmit={handleSubmitContracts}
            noValidate
          >
            {/* Contract Essentials Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Essentials</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="dealName"
                  label="Contract Title"
                  placeholder="Name of your Contract"
                  value={contractsValues.dealName}
                  onChange={(e) =>
                    setContractsValues({ ...contractsValues, dealName: e.target.value })
                  }
                  required
                />
                
                <div className="relative">
                  <Input
                    id="category"
                    label="Contract Occupation Category"
                    placeholder="Contract category"
                    value={contractsValues.category}
                    onChange={(e) => handleCategoryInputChange(e.target.value)}
                    onFocus={handleCategoryInputFocus}
                  />
                  {categorySuggestions.length > 0 && showCategorySuggestions && (
                    <div
                      ref={categorySuggestionsRef}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                      {categorySuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 text-sm cursor-pointer text-gray-900 dark:text-white transition-colors"
                          onClick={() => selectCategorySuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Dropdown
                  label="Contract Stage"
                  items={CONTRACT_STATUS}
                  selectedItem={contractsValues.status}
                  onSelect={(val: string) =>
                    setContractsValues({ ...contractsValues, status: val })
                  }
                  placeholder="Select Stage"
                  width="full"
                />
              </div>
            </section>

            {/* Timeline & Value Section */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline & Value</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Input
                  id="amountPaid"
                  type="number"
                  label="Amount (₹)"
                  placeholder="Budget involved"
                  value={contractsValues.amountPaid}
                  onChange={(e) =>
                    setContractsValues({ ...contractsValues, amountPaid: e.target.value })
                  }
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    id="contractStartDate"
                    type="date"
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                    value={contractsValues.contractStartDate}
                    onChange={(e) =>
                      setContractsValues({
                        ...contractsValues,
                        contractStartDate: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    id="contractEndDate"
                    type="date"
                    label="End Date"
                    placeholder="YYYY-MM-DD"
                    value={contractsValues.contractEndDate}
                    onChange={(e) =>
                      setContractsValues({
                        ...contractsValues,
                        contractEndDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Partnership & Priority Section */}
            <section className="space-y-6 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partnership & Priority</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <Input
                    id="dealPartner"
                    label="Contract With (Partner)"
                    placeholder="Company or Business owner"
                    value={contractsValues.dealPartner}
                    onChange={(e) => handleDealPartnerInputChange(e.target.value)}
                    onFocus={handleDealPartnerInputFocus}
                  />
                  {dealPartnerSuggestions.length > 0 && showDealPartnerSuggestions && (
                    <div
                      ref={dealPartnerSuggestionsRef}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                      {dealPartnerSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 text-sm cursor-pointer text-gray-900 dark:text-white transition-colors"
                          onClick={() => selectDealPartnerSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Dropdown
                  label="Priority Level"
                  items={["Low", "Medium", "High"]}
                  selectedItem={contractsValues.priority}
                  onSelect={(val: string) =>
                    setContractsValues({ ...contractsValues, priority: val })
                  }
                  placeholder="Select Priority"
                  width="full"
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
            label="Create Contract"
            variant="primary"
            type="submit"
            onClick={handleSubmitContracts}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ContractForm;

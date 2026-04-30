import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Dropdown, Button, Input, Icon } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";
import { useAnimatePanel, useClickOutside } from "@/hooks/forms";
import { 
  INDUSTRY_OPTIONS, 
  COMPANY_TYPES, 
  CONTACT_TYPES, 
  CONTRACT_STATUS, 
  PRIORITY_OPTIONS 
} from "@/constants/options";

export type CRMType = "company" | "contact" | "contract" | "receipt" | "task";

interface CRMFormProps {
  userId: string | string[] | undefined;
  onClose: () => void;
  type: CRMType;
}

// Types for related entities
type Company = {
  company_id: number;
  company_name: string;
  occupation?: string;
};

type SaleRecord = {
  sales_id: number;
  sales_name?: string;
  sales_date: string;
  items_sold: string[];
  occupation?: string;
  invoice_created: boolean;
  prices_per_unit?: number[];
};

type ReceiptItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

const initialReceiptItem: ReceiptItem = {
  description: "",
  quantity: 1,
  rate: 0,
  amount: 0,
};

const CRMForm: React.FC<CRMFormProps> = ({ userId, onClose, type }) => {
  const router = useRouter();
  const { saleId: querySaleId } = router.query;
  const [animate, setAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useAnimatePanel(setAnimate);

  const handleCloseAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useClickOutside(panelRef, handleCloseAnimation);

  // --- Shared State ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userSubTypes, setUserSubTypes] = useState<string[]>([]);
  
  // --- Form States ---
  const [companyData, setCompanyData] = useState({
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

  const [contactData, setContactData] = useState({
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

  const [contractData, setContractData] = useState({
    dealName: "",
    dealPartner: "",
    amountPaid: "",
    status: "",
    contractStartDate: "",
    contractEndDate: "",
    category: "",
    priority: "Medium",
  });

  const [receiptData, setReceiptData] = useState({
    title: "",
    receiptNumber: "",
    billTo: "",
    dueDate: "",
    paymentTerms: "",
    notes: "",
    tax: "0",
    discount: "0",
    shipping: "0",
    billToAddressLine1: "",
    billToAddressLine2: "",
    billToCity: "",
    billToState: "",
    billToPostalCode: "",
    billToCountry: "",
    items: [initialReceiptItem],
    linked_sale_id: querySaleId ? Number(querySaleId) : null,
  });

  const [taskData, setTaskData] = useState({
    project: "",
  });

  // --- Suggestions & Extra Data ---
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);
  const [selectedSaleLabel, setSelectedSaleLabel] = useState<string | null>(null);

  // Suggestions Refs & Visibility
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const partnerRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setShowCategorySuggestions(false);
      if (partnerRef.current && !partnerRef.current.contains(event.target as Node)) setShowPartnerSuggestions(false);
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) setShowProjectSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!userId) return;

    const fetchExtras = async () => {
      setIsLoadingExtras(true);
      try {
        const [userRes, companiesRes] = await Promise.all([
          axiosInstance.get(`/user/${userId}`),
          type === "contract" || type === "receipt" ? axiosInstance.get(`/companies/${userId}`) : Promise.resolve({ data: { companies: [] } }),
        ]);

        const user = userRes.data?.data?.user ?? userRes.data?.user;
        setUserSubTypes(Array.isArray(user?.sub_type) ? user.sub_type : []);
        setCompanies(companiesRes.data?.companies || []);

        if (type === "receipt") {
          const salesRes = await axiosInstance.get(`/sales/user/${userId}`);
          const fetchedSales = salesRes.data.sales || [];
          setSales(fetchedSales);

          // Handle preselected sale from query
          if (querySaleId) {
            const preselected = fetchedSales.find((s: SaleRecord) => s.sales_id === Number(querySaleId));
            if (preselected) {
              handleSaleSelection(preselected);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching CRM extras:", error);
      } finally {
        setIsLoadingExtras(false);
      }
    };

    fetchExtras();
  }, [userId, type, querySaleId]);

  const handleSaleSelection = (sale: SaleRecord | "None") => {
    if (sale === "None") {
      setReceiptData(prev => ({
        ...prev,
        linked_sale_id: null,
        title: "",
        billTo: "",
        items: [initialReceiptItem],
      }));
      setSelectedSaleLabel(null);
      return;
    }

    const label = sale.sales_name || `Sale #${sale.sales_id} (${new Date(sale.sales_date).toLocaleDateString()})`;
    setSelectedSaleLabel(label);

    const itemsFromSale = sale.items_sold.map((desc, idx) => ({
      description: desc,
      quantity: 1,
      rate: sale.prices_per_unit?.[idx] || 0,
      amount: sale.prices_per_unit?.[idx] || 0,
    }));

    setReceiptData(prev => ({
      ...prev,
      linked_sale_id: sale.sales_id,
      title: prev.title || (sale.sales_name ? `Invoice for ${sale.sales_name}` : `Invoice for Sale #${sale.sales_id}`),
      billTo: prev.billTo || (sale.occupation || "Customer"),
      items: itemsFromSale.length > 0 ? itemsFromSale : [initialReceiptItem],
    }));

    if (sale.invoice_created) {
      triggerToast("Warning: This sale already has an invoice.", "error");
    }
  };

  // --- Helper Functions for Line Items ---
  const updateReceiptItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...receiptData.items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }
    newItems[index] = item;
    setReceiptData({ ...receiptData, items: newItems });
  };

  // --- Submissions ---
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      let endpoint = "";
      let payload = {};

      switch (type) {
        case "company":
          if (!companyData.companyName || !companyData.contactPerson || !companyData.address_line_1 || !companyData.city || !companyData.state || !companyData.postal_code) {
            triggerToast("Please fill in required company fields.", "error");
            setIsSubmitting(false);
            return;
          }
          endpoint = "/companies/add";
          payload = {
            user_id: Number(userId),
            company_name: companyData.companyName,
            contact_person: companyData.contactPerson,
            email: companyData.email || null,
            phone_number: companyData.phoneNumber || null,
            type: companyData.type || null,
            address_line_1: companyData.address_line_1,
            address_line_2: companyData.address_line_2 || null,
            city: companyData.city,
            state: companyData.state,
            postal_code: companyData.postal_code,
            website: companyData.website || null,
            industry: companyData.industry || null,
          };
          break;

        case "contact":
          if (!contactData.firstName || !contactData.type || !contactData.address_line_1 || !contactData.city || !contactData.state || !contactData.postal_code) {
            triggerToast("Please fill in required contact fields.", "error");
            setIsSubmitting(false);
            return;
          }
          endpoint = "/contacts/add";
          payload = {
            user_id: Number(userId),
            first_name: contactData.firstName,
            last_name: contactData.lastName || null,
            email: contactData.email || null,
            phone_number: contactData.phoneNumber || null,
            type: contactData.type,
            address_line_1: contactData.address_line_1,
            address_line_2: contactData.address_line_2 || null,
            city: contactData.city,
            state: contactData.state,
            postal_code: contactData.postal_code,
          };
          break;

        case "contract":
          if (!contractData.dealName || !contractData.status || !contractData.amountPaid || !contractData.contractStartDate) {
            triggerToast("Please fill in required contract fields.", "error");
            setIsSubmitting(false);
            return;
          }
          endpoint = "/contracts/add";
          payload = {
            user_id: Number(userId),
            deal_name: contractData.dealName,
            partner: contractData.dealPartner,
            amount: parseFloat(contractData.amountPaid),
            stage: contractData.status,
            start_date: contractData.contractStartDate,
            end_date: contractData.contractEndDate || null,
            category: contractData.category || null,
            priority: contractData.priority,
          };
          break;

        case "receipt":
          if (!receiptData.title || !receiptData.billTo || !receiptData.dueDate) {
            triggerToast("Please fill in required invoice fields.", "error");
            setIsSubmitting(false);
            return;
          }
          endpoint = "/receipts/add";
          payload = {
            user_id: Number(userId),
            title: receiptData.title,
            bill_to: receiptData.billTo,
            due_date: receiptData.dueDate,
            receipt_number: receiptData.receiptNumber || null,
            payment_terms: receiptData.paymentTerms || null,
            notes: receiptData.notes || null,
            tax: parseFloat(receiptData.tax) || 0,
            discount: parseFloat(receiptData.discount) || 0,
            shipping: parseFloat(receiptData.shipping) || 0,
            bill_to_address_line1: receiptData.billToAddressLine1 || null,
            bill_to_address_line2: receiptData.billToAddressLine2 || null,
            bill_to_city: receiptData.billToCity || null,
            bill_to_state: receiptData.billToState || null,
            bill_to_postal_code: receiptData.billToPostalCode || null,
            bill_to_country: receiptData.billToCountry || null,
            items: receiptData.items
              .filter(item => item.description.trim())
              .map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                rate: Number(item.rate)
              })),
            linked_sale_id: receiptData.linked_sale_id,
          };
          break;

        case "task":
          if (!taskData.project) {
            triggerToast("Please enter a project name.", "error");
            setIsSubmitting(false);
            return;
          }
          endpoint = "/tasks/add";
          payload = {
            user_id: Number(userId),
            project: taskData.project,
          };
          break;
      }

      const res = await axiosInstance.post(endpoint, payload);
      if (res.status === 201 || res.status === 200) {
        triggerToast(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`, "success");
        handleCloseAnimation();
        window.location.reload();
      }
    } catch (error: any) {
      console.error(`Error creating ${type}:`, error);
      triggerToast(error.response?.data?.message || `Failed to create ${type}.`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtered Suggestions ---
  const filteredCategories = useMemo(() => 
    userSubTypes.filter(s => s.toLowerCase().includes(contractData.category.toLowerCase())), 
    [userSubTypes, contractData.category]
  );
  
  const filteredPartners = useMemo(() => 
    companies.map(c => c.company_name).filter(n => n.toLowerCase().includes(contractData.dealPartner.toLowerCase())),
    [companies, contractData.dealPartner]
  );

  const filteredProjects = useMemo(() => 
    userSubTypes.filter(s => s.toLowerCase().includes(taskData.project.toLowerCase())),
    [userSubTypes, taskData.project]
  );

  const salesDropdownItems = useMemo(() => {
    const items = [{ value: "None", label: "None (No Linked Sale)" }];
    sales.forEach(sale => {
      if (!sale.invoice_created || sale.sales_id === receiptData.linked_sale_id) {
        items.push({
          value: sale.sales_id.toString(),
          label: sale.sales_name || `Sale #${sale.sales_id} (${new Date(sale.sales_date).toLocaleDateString()})`
        });
      }
    });
    return items;
  }, [sales, receiptData.linked_sale_id]);

  // --- Rendering Helpers ---
  const renderHeader = () => {
    const configs = {
      company: { title: "Create New Company", sub: "Add a new business entity to your CRM network." },
      contact: { title: "Create New Contact", sub: "Add a new personal or professional contact." },
      contract: { title: "Create New Contract", sub: "Document a new deal or partnership in your CRM." },
      receipt: { title: "Create New Invoice", sub: "Generate a professional invoice for your customer." },
      task: { title: "Create New Project", sub: "Initialize a new category for your tasks." },
    };
    const { title, sub } = configs[type];
    return (
      <div className="px-8 py-6 flex justify-between items-center border-b border-gray-400 dark:border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-dark dark:text-light mt-1">{sub}</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-600 text-dark dark:text-light transition-all" onClick={handleCloseAnimation}>
          <Icon type="close" className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-700 overflow-hidden flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          type === "receipt" ? "w-full md:w-[640px]" : "w-full md:w-[540px]"
        }`}
        style={{ transform: animate ? "translateX(0)" : "translateX(100%)" }}
      >
        {renderHeader()}

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            {type === "company" && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="companyName" label="Company Name" placeholder="Enter company name" value={companyData.companyName} onChange={e => setCompanyData({...companyData, companyName: e.target.value})} required />
                    <Input id="contactPerson" label="Contact Person / Owner" placeholder="e.g. John Doe" value={companyData.contactPerson} onChange={e => setCompanyData({...companyData, contactPerson: e.target.value})} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="companyEmail" label="Company Email" type="email" value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} />
                      <Input id="companyPhone" label="Company Phone" value={companyData.phoneNumber} onChange={e => setCompanyData({...companyData, phoneNumber: e.target.value})} />
                    </div>
                  </div>
                </section>
                <section className="space-y-6 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile & Industry</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="companyWebsite" label="Company Website" value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Dropdown items={INDUSTRY_OPTIONS} selectedItem={companyData.industry} onSelect={v => setCompanyData({...companyData, industry: v})} label="Industry" width="full" />
                      <Dropdown items={COMPANY_TYPES} selectedItem={companyData.type} onSelect={v => setCompanyData({...companyData, type: v})} label="Company Type" width="full" />
                    </div>
                  </div>
                </section>
                <section className="space-y-6 pt-4 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="addressLine1" label="Address Line 1" value={companyData.address_line_1} onChange={e => setCompanyData({...companyData, address_line_1: e.target.value})} required />
                    <Input id="addressLine2" label="Address Line 2 (Optional)" value={companyData.address_line_2} onChange={e => setCompanyData({...companyData, address_line_2: e.target.value})} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Input id="city" label="City" placeholder="Guwahati" value={companyData.city} onChange={e => setCompanyData({...companyData, city: e.target.value})} required />
                      <Input id="state" label="State" placeholder="Assam" value={companyData.state} onChange={e => setCompanyData({...companyData, state: e.target.value})} required />
                      <Input id="postalCode" label="Postal Code" placeholder="781001" value={companyData.postal_code} onChange={e => setCompanyData({...companyData, postal_code: e.target.value})} required />
                    </div>
                  </div>
                </section>
              </>
            )}

            {type === "contact" && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="firstName" label="First Name" placeholder="John" value={contactData.firstName} onChange={e => setContactData({...contactData, firstName: e.target.value})} required />
                      <Input id="lastName" label="Last Name" placeholder="Doe" value={contactData.lastName} onChange={e => setContactData({...contactData, lastName: e.target.value})} />
                    </div>
                    <Dropdown items={CONTACT_TYPES} selectedItem={contactData.type} onSelect={v => setContactData({...contactData, type: v})} label="Contact Type" width="full" />
                  </div>
                </section>
                <section className="space-y-6 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-blue-200 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-dark dark:text-white">Contact Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="contactEmail" label="Email Address" type="email" placeholder="john.doe@email.com" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} />
                    <Input id="contactPhone" label="Phone Number" placeholder="+91 XXXXX XXXXX" value={contactData.phoneNumber} onChange={e => setContactData({...contactData, phoneNumber: e.target.value})} />
                  </div>
                </section>
                <section className="space-y-6 pt-4 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-yellow-200 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-dark dark:text-white">Location Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="contactAddress1" label="Address Line 1" value={contactData.address_line_1} onChange={e => setContactData({...contactData, address_line_1: e.target.value})} required />
                    <Input id="contactAddress2" label="Address Line 2 (Optional)" value={contactData.address_line_2} onChange={e => setContactData({...contactData, address_line_2: e.target.value})} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Input id="contactCity" label="City" placeholder="Guwahati" value={contactData.city} onChange={e => setContactData({...contactData, city: e.target.value})} required />
                      <Input id="contactState" label="State" placeholder="Assam" value={contactData.state} onChange={e => setContactData({...contactData, state: e.target.value})} required />
                      <Input id="contactPostalCode" label="Postal Code" placeholder="781001" value={contactData.postal_code} onChange={e => setContactData({...contactData, postal_code: e.target.value})} required />
                    </div>
                  </div>
                </section>
              </>
            )}

            {type === "contract" && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Essentials</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="contractTitle" label="Contract Title" value={contractData.dealName} onChange={e => setContractData({...contractData, dealName: e.target.value})} required />
                    <div className="relative">
                      <Input id="contractCategory" label="Occupation Category" value={contractData.category} onChange={e => setContractData({...contractData, category: e.target.value})} onFocus={() => setShowCategorySuggestions(true)} />
                      {showCategorySuggestions && filteredCategories.length > 0 && (
                        <div ref={categoryRef} className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                          {filteredCategories.map((s, i) => (
                            <div key={i} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer" onClick={() => { setContractData({...contractData, category: s}); setShowCategorySuggestions(false); }}>{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Dropdown label="Contract Stage" items={CONTRACT_STATUS} selectedItem={contractData.status} onSelect={v => setContractData({...contractData, status: v})} width="full" />
                  </div>
                </section>
                <section className="space-y-6 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline & Value</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="contractAmount" label="Amount (₹)" type="number" value={contractData.amountPaid} onChange={e => setContractData({...contractData, amountPaid: e.target.value})} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="startDate" label="Start Date" type="date" value={contractData.contractStartDate} onChange={e => setContractData({...contractData, contractStartDate: e.target.value})} required />
                      <Input id="endDate" label="End Date" type="date" value={contractData.contractEndDate} onChange={e => setContractData({...contractData, contractEndDate: e.target.value})} />
                    </div>
                  </div>
                </section>
                <section className="space-y-6 pt-4 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partnership & Priority</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                      <Input id="contractPartner" label="Contract With (Partner)" value={contractData.dealPartner} onChange={e => setContractData({...contractData, dealPartner: e.target.value})} onFocus={() => setShowPartnerSuggestions(true)} />
                      {showPartnerSuggestions && filteredPartners.length > 0 && (
                        <div ref={partnerRef} className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                          {filteredPartners.map((n, i) => (
                            <div key={i} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer" onClick={() => { setContractData({...contractData, dealPartner: n}); setShowPartnerSuggestions(false); }}>{n}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Dropdown label="Priority Level" items={PRIORITY_OPTIONS} selectedItem={contractData.priority} onSelect={v => setContractData({...contractData, priority: v})} width="full" />
                  </div>
                </section>
              </>
            )}

            {type === "receipt" && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="invoiceTitle" label="Invoice Title" value={receiptData.title} onChange={e => setReceiptData({...receiptData, title: e.target.value})} required />
                      <Input id="invoiceNumber" label="Invoice Number" value={receiptData.receiptNumber} onChange={e => setReceiptData({...receiptData, receiptNumber: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="invoiceBillTo" label="Bill To (Customer)" value={receiptData.billTo} onChange={e => setReceiptData({...receiptData, billTo: e.target.value})} required />
                      <Input id="invoiceDueDate" label="Due Date" type="date" value={receiptData.dueDate} onChange={e => setReceiptData({...receiptData, dueDate: e.target.value})} required />
                    </div>
                    <Dropdown label="Link to Sale (Optional)" items={salesDropdownItems.map(i => i.label)} selectedItem={selectedSaleLabel || "None"} onSelect={l => {
                      const item = salesDropdownItems.find(i => i.label === l);
                      const sale = sales.find(s => s.sales_id.toString() === item?.value);
                      handleSaleSelection(sale || "None");
                    }} width="full" />
                    <Input id="paymentTerms" label="Payment Terms" value={receiptData.paymentTerms} onChange={e => setReceiptData({...receiptData, paymentTerms: e.target.value})} />
                  </div>
                </section>
                <section className="space-y-6 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-dark dark:text-light">Invoice Items</h3>
                    </div>
                    <Button label="Add Item" variant="secondary" icon={{ left: "add" }} size="sm" onClick={() => setReceiptData({...receiptData, items: [...receiptData.items, {...initialReceiptItem}]})} />
                  </div>
                  <div className="space-y-4">
                    {receiptData.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5"><Input id={`item-desc-${idx}`} label="Description" value={item.description} onChange={e => updateReceiptItem(idx, "description", e.target.value)} /></div>
                        <div className="col-span-2"><Input id={`item-qty-${idx}`} label="Qty" type="number" value={item.quantity} onChange={e => updateReceiptItem(idx, "quantity", Number(e.target.value))} /></div>
                        <div className="col-span-2"><Input id={`item-rate-${idx}`} label="Rate" type="number" value={item.rate} onChange={e => updateReceiptItem(idx, "rate", Number(e.target.value))} /></div>
                        <div className="col-span-2 text-right py-2"><p className="text-xs text-dark dark:text-light">Amount</p><p className="font-semibold text-gray-900 dark:text-white">₹{item.amount.toFixed(2)}</p></div>
                        <div className="col-span-1 text-right">
                          <button type="button" className="text-red-500 p-1" onClick={() => setReceiptData({...receiptData, items: receiptData.items.filter((_, i) => i !== idx)})} disabled={receiptData.items.length === 1}><Icon type="delete" size="md" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="space-y-6 pt-4 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Address (Optional)</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <Input id="billToAddress1" label="Address Line 1" value={receiptData.billToAddressLine1} onChange={e => setReceiptData({...receiptData, billToAddressLine1: e.target.value})} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="billToCity" label="City" value={receiptData.billToCity} onChange={e => setReceiptData({...receiptData, billToCity: e.target.value})} />
                      <Input id="billToState" label="State" value={receiptData.billToState} onChange={e => setReceiptData({...receiptData, billToState: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input id="billToPostalCode" label="Postal Code" value={receiptData.billToPostalCode} onChange={e => setReceiptData({...receiptData, billToPostalCode: e.target.value})} />
                      <Input id="billToCountry" label="Country" value={receiptData.billToCountry} onChange={e => setReceiptData({...receiptData, billToCountry: e.target.value})} />
                    </div>
                  </div>
                </section>
              </>
            )}

            {type === "task" && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                      <Input id="taskProject" label="Project Category" value={taskData.project} onChange={e => setTaskData({...taskData, project: e.target.value})} onFocus={() => setShowProjectSuggestions(true)} required />
                      {showProjectSuggestions && filteredProjects.length > 0 && (
                        <div ref={projectRef} className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                          {filteredProjects.map((s, i) => (
                            <div key={i} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer" onClick={() => { setTaskData({...taskData, project: s}); setShowProjectSuggestions(false); }}>{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex gap-3">
                    <Icon type="info" className="text-blue-500 shrink-0" size="sm" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Projects help you organize related tasks. Once created, you can add specific activities, deadlines, and priorities to this category.
                    </p>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="p-8 border-t border-gray-400 dark:border-gray-200 grid grid-cols-2 gap-4 w-full">
          <Button label="Cancel" variant="secondary" onClick={handleCloseAnimation} className="w-full" disabled={isSubmitting} />
          <Button label={isSubmitting ? "Creating..." : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`} variant="primary" type="submit" onClick={handleSubmit} className="w-full" disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default CRMForm;

import { FormField } from "@/components/form/BottomDrawer";

// DASHBOARD WIDGET CONFIGURATIONS
export const ALL_AVAILABLE_WIDGETS = [
  { id: "Task Calendar", name: "Task Calendar", requiredSubType: null },
  { id: "Trend Graph", name: "Financial Trend Graph", requiredSubType: null },
  {
    id: "Compare Graph",
    name: "Financial Compare Graph",
    requiredSubType: null,
  },
  {
    id: "Working Capital",
    name: "Working Capital Analysis",
    requiredSubType: null,
  },
  {
    id: "Loans & Debt",
    name: "Loans & Debt Analysis",
    requiredSubType: null,
  },
  {
    id: "Poultry Task Manager",
    name: "Poultry Task Manager",
    requiredSubType: "Poultry",
  },
  {
    id: "Poultry Inventory Stock",
    name: "Poultry Inventory",
    requiredSubType: "Poultry",
  },
  {
    id: "Apiculture Task Manager",
    name: "Apiculture Task Manager",
    requiredSubType: "Apiculture",
  },
  {
    id: "Apiculture Inventory Stock",
    name: "Apiculture Inventory",
    requiredSubType: "Apiculture",
  },
  {
    id: "Cattle Rearing Task Manager",
    name: "Cattle Rearing Task Manager",
    requiredSubType: "Cattle Rearing",
  },
  {
    id: "Cattle Rearing Inventory Stock",
    name: "Cattle Rearing Inventory",
    requiredSubType: "Cattle Rearing",
  },
];

// CRM FORM CONFIGURATIONS (Contacts, Companies, Contracts)
export type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

export type CompanyFormData = {
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  type: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  website: string;
  industry: string;
};

export type ContractFormData = {
  deal_name: string;
  partner: string;
  amount: string;
  stage: string;
  start_date: string;
  end_date: string;
  category: string;
  priority: string;
};

export type TaskFormData = {
  project: string;
};

export type ReceiptFormData = {
  title: string;
  receiptNumber: string;
  billTo: string;
  dueDate: string;
  notes: string;
  tax: string;
  discount: string;
  shipping: string;
  items: any[];
  linked_sale_id: number | null;
};

export const CONTACT_TYPES = [
  "Customer",
  "Supplier",
  "Lead",
  "Partner",
  "Employee",
  "Other",
];

export const COMPANY_TYPES = ["Supplier", "Distributor", "Factory", "Buyer", "Other"];

export const CONTRACT_STATUS = [
  "Prospecting",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "On Hold",
];

export const PRIORITY_LEVELS = ["Low", "Medium", "High"];

export const CONTACT_FIELDS: FormField[] = [
  {
    name: "first_name",
    label: "First Name",
    type: "text",
    icon: "account",
    halfWidth: true,
    required: true,
  },
  { name: "last_name", label: "Last Name", type: "text", halfWidth: true },
  { name: "email", label: "Email", type: "email", icon: "email" },
  { name: "phone_number", label: "Phone Number", type: "phone", icon: "phone" },
  {
    name: "type",
    label: "Contact Type",
    type: "dropdown",
    items: CONTACT_TYPES,
    icon: "contacts",
    required: true,
  },
  {
    name: "address_line_1",
    label: "Address Line 1",
    type: "text",
    icon: "pin",
    required: true,
  },
  { name: "address_line_2", label: "Address Line 2", type: "text" },
  {
    name: "city",
    label: "City",
    type: "text",
    icon: "city",
    halfWidth: true,
    required: true,
  },
  {
    name: "state",
    label: "State",
    type: "text",
    icon: "map",
    halfWidth: true,
    required: true,
  },
  {
    name: "postal_code",
    label: "Postal Code",
    type: "text",
    icon: "tag",
    required: true,
  },
];

export const COMPANY_FIELDS: FormField[] = [
  {
    name: "company_name",
    label: "Company Name",
    type: "text",
    icon: "domain",
    required: true,
  },
  {
    name: "contact_person",
    label: "Contact Person",
    type: "text",
    icon: "account",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    icon: "email",
    halfWidth: true,
  },
  {
    name: "phone_number",
    label: "Phone Number",
    type: "phone",
    icon: "phone",
    halfWidth: true,
  },
  {
    name: "type",
    label: "Company Type",
    type: "dropdown",
    items: COMPANY_TYPES,
    icon: "factory",
    required: true,
  },
  {
    name: "address_line_1",
    label: "Address Line 1",
    type: "text",
    icon: "pin",
    required: true,
  },
  { name: "address_line_2", label: "Address Line 2", type: "text" },
  {
    name: "city",
    label: "City",
    type: "text",
    icon: "city",
    halfWidth: true,
    required: true,
  },
  {
    name: "state",
    label: "State",
    type: "text",
    icon: "map",
    halfWidth: true,
    required: true,
  },
  {
    name: "postal_code",
    label: "Postal Code",
    type: "text",
    icon: "tag",
    required: true,
  },
  { name: "website", label: "Website", type: "text", icon: "web", halfWidth: true },
  {
    name: "industry",
    label: "Industry",
    type: "text",
    icon: "factory",
    halfWidth: true,
  },
];

export const CONTRACT_FIELDS: FormField[] = [
  {
    name: "deal_name",
    label: "Contract Title",
    type: "text",
    icon: "file-document",
    required: true,
  },
  {
    name: "partner",
    label: "Contract With (Partner)",
    type: "text",
    icon: "handshake",
  },
  {
    name: "stage",
    label: "Contract Stage",
    type: "dropdown",
    items: CONTRACT_STATUS,
    icon: "stairs",
    required: true,
  },
  {
    name: "amount",
    label: "Amount (₹)",
    type: "number",
    icon: "currency-inr",
    required: true,
  },
  {
    name: "start_date",
    label: "Start Date",
    type: "date",
    required: true,
    halfWidth: true,
  },
  {
    name: "end_date",
    label: "End Date (Optional)",
    type: "date",
    halfWidth: true,
  },
  { name: "category", label: "Category", type: "text" },
  {
    name: "priority",
    label: "Priority",
    type: "dropdown",
    items: PRIORITY_LEVELS,
    icon: "flag",
  },
];

// CATTLE FORM CONFIGURATIONS
export type CattleFormData = {
  cattle_name: string;
  cattle_type: string;
  number_of_animals: string;
  purpose: string;
};

export const CATTLE_TYPES_OPTIONS = ["Cows", "Buffalo", "Goat"];

export const CATTLE_PURPOSE_OPTIONS = [
  "Milk Production",
  "Meat Production",
  "Breeding",
  "Ploughing/Transport",
];

export const CATTLE_FIELDS: FormField[] = [
  {
    name: "cattle_name",
    label: "Cattle / Herd Name",
    type: "text",
    icon: "tag-outline",
    required: true,
  },
  {
    name: "number_of_animals",
    label: "Number of Animals",
    type: "number",
    icon: "numeric",
    required: true,
  },
  {
    name: "cattle_type",
    label: "Cattle Type",
    type: "dropdown",
    items: CATTLE_TYPES_OPTIONS,
    icon: "cow",
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "dropdown",
    items: CATTLE_PURPOSE_OPTIONS,
    icon: "target",
  },
];

// WAREHOUSE FORM CONFIGURATIONS
export type WarehouseFormData = {
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

export const WAREHOUSE_TYPES = [
  "Ambient Storage",
  "Cold Storage",
  "Climate Controlled Storage",
  "Bulk Silo Storage",
  "Packhouse",
  "Hazardous Storage",
];

export const WAREHOUSE_FIELDS: FormField[] = [
  { name: "name", label: "Warehouse Name", type: "text", required: true },
  {
    name: "type",
    label: "Warehouse Type",
    type: "dropdown",
    items: WAREHOUSE_TYPES,
    required: true,
  },
  {
    name: "address_line_1",
    label: "Address Line 1",
    type: "text",
    required: true,
  },
  { name: "address_line_2", label: "Address Line 2 (Optional)", type: "text" },
  {
    name: "city",
    label: "City",
    type: "text",
    halfWidth: true,
    required: true,
  },
  {
    name: "state",
    label: "State / Province",
    type: "text",
    halfWidth: true,
    required: true,
  },
  {
    name: "postal_code",
    label: "Postal Code",
    type: "text",
    halfWidth: true,
    required: true,
  },
  {
    name: "country",
    label: "Country",
    type: "text",
    halfWidth: true,
    required: true,
  },
  {
    name: "contact_person",
    label: "Contact Person (Optional)",
    type: "text",
    halfWidth: true,
  },
  {
    name: "phone",
    label: "Phone Number (Optional)",
    type: "phone",
    halfWidth: true,
  },
  {
    name: "storage_capacity",
    label: "Storage Capacity (sq. ft.)",
    type: "number",
  },
];

// APICULTURE FORM CONFIGURATIONS
export type ApicultureFormData = {
  apiary_name: string;
  number_of_hives: string;
  bee_species: string;
  hive_type: string;
  queen_source: string;
  area: string;
  notes: string;
};

export type HiveFormData = {
  hive_name: string;
  hive_type: string;
  bee_species: string;
  installation_date: string;
  honey_capacity: string;
  unit: string;
  ventilation_status: string;
  notes: string;
};

export type InventoryFormData = {
  itemName: string;
  feed: boolean;
  itemGroup: string;
  units: string;
  quantity: string;
  pricePerUnit: string;
  minimumLimit?: string;
};

export type FlockFormData = {
  flock_name: string;
  flock_type: string;
  breed: string;
  quantity: string;
  source: string;
  housing_type: string;
  notes: string;
};

export type VeterinaryFormData = {
  visit_date: string;
  doctor_name: string;
  purpose: string;
  cost: string;
  recommendations: string;
};

export type LoanFormData = {
  loan_name: string;
  lender: string;
  amount: string;
  interest_rate: string;
  start_date: string;
  end_date: string;
};

export type ExpenseFormData = {
  title: string;
  date_created: string;
  expense: string;
  occupation: string;
  category: string;
};

export type InspectionFormData = {
  inspection_id?: number;
  inspection_date: string;
  queen_status: string;
  queen_introduced_date: string;
  brood_pattern: string;
  population_strength: string;
  frames_of_brood: string;
  frames_of_nectar_honey: string;
  frames_of_pollen: string;
  room_to_lay: string;
  queen_cells_observed: string;
  queen_cells_count: string;
  symptoms: string[];
  actions_taken: string;
  notes: string;
};

export const BEE_SPECIES = [
  "European Honey Bee (Apis mellifera)",
  "Indian Hive Bee (Apis cerana indica)",
  "Apis cerana (Asiatic Honey Bee)",
  "Apis dorsata (Giant Honey Bee)",
  "Trigona (Stingless Bees)",
  "Other",
];

export const HIVE_TYPES = [
  "Langstroth Hive",
  "Newton Hive",
  "Jeolikote Hive",
  "Top-bar",
  "Warre",
  "Flow Hive",
  "Traditional Log Hive",
  "Other",
];

export const APICULTURE_FIELDS: FormField[] = [
  {
    name: "apiary_name",
    label: "Bee Yard Name",
    type: "text",
    icon: "tag",
    required: true,
  },
  {
    name: "number_of_hives",
    label: "Number of Hives",
    type: "number",
    icon: "dots-grid",
    halfWidth: true,
    required: true,
  },
  {
    name: "area",
    label: "Area (sq. m) (Optional)",
    type: "number",
    icon: "ruler",
    halfWidth: true,
  },
  {
    name: "bee_species",
    label: "Bee Species (Optional)",
    type: "dropdown",
    items: BEE_SPECIES,
    icon: "bee",
  },
  {
    name: "hive_type",
    label: "Hive Type (Optional)",
    type: "dropdown",
    items: HIVE_TYPES,
    icon: "home-outline",
  },
  {
    name: "queen_source",
    label: "Queen Source (Optional)",
    type: "text",
    icon: "crown",
  },
  {
    name: "notes",
    label: "Notes (Optional)",
    type: "text",
    icon: "note-text",
  },
];

// INVENTORY FORM CONFIGURATIONS
export const INVENTORY_UNITS = [
  "kg", "g", "liters", "ml", "units", "packets", "boxes", "bottles", "cans", "bags", "rolls", "meters", "feet"
];

export const INVENTORY_FIELDS: FormField[] = [
  { name: "itemName", label: "Item Name", type: "text", icon: "package-variant", required: true },
  { name: "feed", label: "Is this a Feed?", type: "checkbox" },
  { name: "itemGroup", label: "Item Occupation", type: "autocomplete", icon: "briefcase", required: true },
  { name: "units", label: "Units", type: "dropdown", items: INVENTORY_UNITS, icon: "scale", required: true },
  { name: "quantity", label: "Quantity", type: "number", icon: "numeric", halfWidth: true, required: true },
  { name: "pricePerUnit", label: "Price Per Unit", type: "number", icon: "currency-inr", halfWidth: true, required: true },
  { name: "minimumLimit", label: "Minimum Stock Limit (Optional)", type: "number", icon: "alert-outline" },
];

// POULTRY FORM CONFIGURATIONS
export const POULTRY_TYPES = ["Chickens", "Ducks", "Quails", "Turkeys", "Geese", "Others"];
export const HOUSING_TYPES = ["Deep Litter", "Battery Cage", "Free Range", "Semi-Intensive"];

export const FLOCK_FIELDS: FormField[] = [
  { name: "flock_name", label: "Flock Name", type: "text", icon: "tag-outline", required: true },
  { name: "flock_type", label: "Flock Type", type: "dropdown", items: POULTRY_TYPES, icon: "bird", required: true },
  { name: "breed", label: "Breed (Optional)", type: "autocomplete", icon: "dna" },
  { name: "quantity", label: "Quantity", type: "number", icon: "numeric", halfWidth: true, required: true },
  { name: "source", label: "Source (Optional)", type: "text", icon: "truck-delivery-outline", halfWidth: true },
  { name: "housing_type", label: "Housing Type (Optional)", type: "dropdown", items: HOUSING_TYPES, icon: "home-outline" },
  { name: "notes", label: "Notes (Optional)", type: "text", icon: "note-text-outline", multiline: true },
];

export const VETERINARY_FIELDS: FormField[] = [
  { name: "visit_date", label: "Visit Date", type: "date", icon: "calendar", required: true },
  { name: "doctor_name", label: "Doctor Name", type: "text", icon: "doctor", required: true },
  { name: "purpose", label: "Purpose of Visit", type: "text", icon: "clipboard-pulse", multiline: true },
  { name: "cost", label: "Cost (₹)", type: "number", icon: "currency-inr", required: true },
  { name: "recommendations", label: "Recommendations", type: "text", icon: "message-draw", multiline: true },
];

// FINANCE FORM CONFIGURATIONS
export const EXPENSE_CATEGORIES = [
  "Farm Utilities", "Agricultural Feeds", "Consulting", "Electricity", "Labour Salary", "Water Supply", "Taxes", "Others"
];

export const EXPENSE_FIELDS: FormField[] = [
  { name: "title", label: "Expense Title", type: "text", icon: "format-title", required: true },
  { name: "date_created", label: "Date", type: "date", icon: "calendar", halfWidth: true, required: true },
  { name: "expense", label: "Amount (₹)", type: "number", icon: "currency-inr", halfWidth: true, required: true },
  { name: "occupation", label: "Related Occupation", type: "autocomplete", icon: "briefcase" },
  { name: "category", label: "Expense Category", type: "dropdown", items: EXPENSE_CATEGORIES, icon: "shape-outline", required: true },
];

export const LOAN_FIELDS: FormField[] = [
  { name: "loan_name", label: "Loan Name", type: "text", icon: "bank", required: true },
  { name: "lender", label: "Lender", type: "text", icon: "domain", required: true },
  { name: "amount", label: "Amount (₹)", type: "number", icon: "currency-inr", halfWidth: true, required: true },
  { name: "interest_rate", label: "Interest Rate (%)", type: "number", icon: "percent", halfWidth: true, required: true },
  { name: "start_date", label: "Start Date", type: "date", icon: "calendar", halfWidth: true, required: true },
  { name: "end_date", label: "End Date (Optional)", type: "date", icon: "calendar", halfWidth: true },
];

export const SALES_FIELDS: FormField[] = [
  { name: "sales_name", label: "Sales Title", type: "text", icon: "format-title" },
  { name: "sales_date", label: "Sales Date", type: "date", icon: "calendar", required: true },
  { name: "occupation", label: "Occupation", type: "autocomplete", icon: "briefcase" },
];

// CRM TASK CONFIGURATION
export const TASK_FIELDS: FormField[] = [
  { name: "project", label: "Project Name / Task Category", type: "autocomplete", icon: "briefcase", required: true },
];

// RECEIPT CONFIGURATION
export const RECEIPT_FIELDS: FormField[] = [
  { name: "title", label: "Invoice Title", type: "text", icon: "file-document", required: true },
  { name: "billTo", label: "Bill To", type: "text", icon: "account", halfWidth: true, required: true },
  { name: "dueDate", label: "Due Date", type: "date", icon: "calendar", halfWidth: true, required: true }, { name: "linked_sale_id", label: "Link to Sale (Optional)", type: "dropdown", icon: "link" },
  { name: "receiptNumber", label: "Receipt Number (Optional)", type: "text", icon: "pound" },
  { name: "tax", label: "Tax (%)", type: "number", icon: "percent", halfWidth: true },
  { name: "discount", label: "Discount (₹)", type: "number", icon: "tag", halfWidth: true },
  { name: "shipping", label: "Shipping (₹)", type: "number", icon: "truck-delivery", halfWidth: true },
  { name: "notes", label: "Notes", type: "text", icon: "note-text", multiline: true },
];

// APICULTURE HIVE CONFIGURATIONS
export const VENTILATION_STATUS = [
  "Top Ventilation (Upper Hive Venting)",
  "Bottom Ventilation (Lower Hive Venting)",
  "Entrance Ventilation"
];

export const HIVE_FIELDS: FormField[] = [
  { name: "hive_name", label: "Hive Name", type: "text", icon: "tag", required: true },
  { name: "hive_type", label: "Hive Type", type: "dropdown", items: HIVE_TYPES, icon: "warehouse", halfWidth: true },
  { name: "bee_species", label: "Bee Species", type: "dropdown", items: BEE_SPECIES, icon: "bird", halfWidth: true },
  { name: "installation_date", label: "Installation Date", type: "date", icon: "calendar", halfWidth: true },
  { name: "honey_capacity", label: "Honey Capacity", type: "number", icon: "beehive-outline", halfWidth: true },
  { name: "unit", label: "Unit", type: "dropdown", items: ["kilograms (kg)", "pounds (lbs)"], icon: "scale", halfWidth: true },
  { name: "ventilation_status", label: "Ventilation", type: "dropdown", items: VENTILATION_STATUS, icon: "air-filter", halfWidth: true },
  { name: "notes", label: "Notes", type: "text", icon: "note-text", multiline: true },
];

export const QUEEN_STATUS_OPTIONS = [
  "Present & Healthy", "Absent (No Queen)", "Weak (Poor Laying)", "Drone-Laying", "Virgin (Unmated)", "Recently Introduced", "Swarmed (Gone)"
];
export const BROOD_PATTERN_OPTIONS = ["Good (Healthy)", "Spotty (Irregular)", "Drone-Laying", "No Brood (Empty Comb)"];
export const POPULATION_STRENGTH_OPTIONS = ["Booming", "Strong", "Moderate", "Weak"];

export const INSPECTION_FIELDS: FormField[] = [
  { name: "inspection_date", label: "Inspection Date", type: "date", icon: "calendar", required: true },
  { name: "queen_status", label: "Queen Status", type: "dropdown", items: QUEEN_STATUS_OPTIONS, icon: "crown", halfWidth: true },
  { name: "queen_introduced_date", label: "Queen Introduced Date", type: "date", icon: "calendar-plus", halfWidth: true },
  { name: "brood_pattern", label: "Brood Pattern", type: "dropdown", items: BROOD_PATTERN_OPTIONS, icon: "grid", halfWidth: true },
  { name: "population_strength", label: "Population Strength", type: "dropdown", items: POPULATION_STRENGTH_OPTIONS, icon: "account-group", halfWidth: true },
  { name: "frames_of_brood", label: "Frames of Brood", type: "number", icon: "numeric-1-box", halfWidth: true },
  { name: "frames_of_nectar_honey", label: "Frames of Nectar/Honey", type: "number", icon: "numeric-2-box", halfWidth: true },
  { name: "frames_of_pollen", label: "Frames of Pollen", type: "number", icon: "numeric-3-box", halfWidth: true },
  { name: "room_to_lay", label: "Room to Lay?", type: "dropdown", items: ["Plenty", "Adequate", "Limited", "None"], icon: "bed", halfWidth: true },
  { name: "queen_cells_observed", label: "Queen Cells Observed?", type: "dropdown", items: ["Yes", "No"], icon: "help-circle", halfWidth: true },
  { name: "queen_cells_count", label: "Queen Cells Count", type: "number", icon: "counter", halfWidth: true },
  { name: "symptoms", label: "Symptoms Observed", type: "tags", icon: "alert-circle" },
  { name: "actions_taken", label: "Actions Taken", type: "text", icon: "gesture-tap", multiline: true },
  { name: "notes", label: "General Notes", type: "text", icon: "note-text", multiline: true },
];

// UPDATED SALES FIELDS WITH DYNAMIC LIST
export const SALES_FIELDS_WITH_ITEMS: FormField[] = [
  { name: "sales_name", label: "Sales Title", type: "text", icon: "format-title" },
  { name: "sales_date", label: "Sales Date", type: "date", icon: "calendar", required: true },
  { name: "occupation", label: "Occupation", type: "autocomplete", icon: "briefcase" },
  {
    name: "items",
    label: "Items Sold",
    type: "dynamic-list",
    subFields: [
      { name: "name", label: "Item Name", type: "text", icon: "package-variant" },
      { name: "quantity", label: "Qty", type: "number", icon: "numeric", halfWidth: true },
      { name: "unit", label: "Unit", type: "text", icon: "scale", halfWidth: true },
      { name: "price_per_unit", label: "Price/Unit", type: "number", icon: "currency-inr", halfWidth: true },
    ]
  }
];

// UPDATED RECEIPT FIELDS WITH DYNAMIC LIST
export const RECEIPT_FIELDS_WITH_ITEMS: FormField[] = [
  { name: "title", label: "Invoice Title", type: "text", icon: "file-document", required: true },
  { name: "billTo", label: "Bill To", type: "text", icon: "account", halfWidth: true, required: true },
  { name: "dueDate", label: "Due Date", type: "date", icon: "calendar", halfWidth: true, required: true }, { name: "linked_sale_id", label: "Link to Sale (Optional)", type: "dropdown", icon: "link" },
  { name: "receiptNumber", label: "Receipt Number (Optional)", type: "text", icon: "pound" },
  {
    name: "items",
    label: "Items",
    type: "dynamic-list",
    subFields: [
      { name: "description", label: "Description", type: "text", icon: "text" },
      { name: "quantity", label: "Qty", type: "number", icon: "numeric", halfWidth: true },
      { name: "price", label: "Price", type: "number", icon: "currency-inr", halfWidth: true },
    ]
  },
  { name: "tax", label: "Tax (%)", type: "number", icon: "percent", halfWidth: true },
  { name: "discount", label: "Discount (₹)", type: "number", icon: "tag", halfWidth: true },
  { name: "shipping", label: "Shipping (₹)", type: "number", icon: "truck-delivery", halfWidth: true },
  { name: "notes", label: "Notes", type: "text", icon: "note-text", multiline: true },
];

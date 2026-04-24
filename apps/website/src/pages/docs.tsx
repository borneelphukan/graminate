import React from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { motion } from "framer-motion";
import { Icon } from "@graminate/ui";
import { useTranslation } from "@/contexts/I18nContext";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const docCategories = [
  {
    title: "Core Modules",
    icon: "grid_view",
    items: [
      { name: "Livestock Management", desc: "Detailed tracking for Cattle and Poultry production lines.", icon: "pets" },
      { name: "Apiculture Management", desc: "Specialized tools for beekeeping and honey production.", icon: "hive" },
      { name: "Crop Monitoring", desc: "Monitor growth cycles and yield expectations.", icon: "grass" },
    ],
  },
  {
    title: "Operations & ERP",
    icon: "account_balance",
    items: [
      { name: "CRM & Contacts", desc: "Manage client databases, contracts, and receipts.", icon: "contact_page" },
      { name: "Inventory & Warehouse", desc: "Track stock levels, inputs, and expired goods.", icon: "inventory_2" },
      { name: "Finance Tracker", desc: "Monitor live expenses, losses, and overall profit.", icon: "payments" },
    ],
  },
  {
    title: "Smart Intelligence",
    icon: "psychology",
    items: [
      { name: "AI Assistant", desc: "Real-time advice on animal health and task priority.", icon: "smart_toy" },
      { name: "Weather Monitor", desc: "Hyper-local updates and crop-specific alerts.", icon: "wb_sunny" },
      { name: "Commodity Prices", desc: "Monitor live market trends and historical data.", icon: "trending_up" },
    ],
  },
  {
    title: "Administration",
    icon: "admin_panel_settings",
    items: [
      { name: "User Roles & Permissions", desc: "Configure access for workers, managers, and admins.", icon: "manage_accounts" },
      { name: "Enterprise Dashboard", desc: "High-level analytics for cooperatives and distributors.", icon: "dashboard" },
      { name: "Regional Settings", desc: "Configure currencies, units, and localized data.", icon: "public" },
    ],
  },
];

export default function Docs() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Handle Command+K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter categories and items based on search query
  const filteredCategories = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return docCategories;
    
    return docCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            cat.title.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      <Head>
        <title>Documentation | Graminate</title>
        <meta
          name="description"
          content="Comprehensive guides and documentation for the Graminate Agricultural ERP and AI Assistant."
        />
      </Head>

      <DefaultLayout>
        <div className="relative bg-white pt-24 pb-32 overflow-hidden min-h-screen">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-50 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="max-w-4xl mx-auto text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-6">
                <Icon type="auto_stories" className="size-4" />
                Knowledge Base
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-8 tracking-tight">
                How can we help you <span className="text-emerald-600">grow?</span>
              </h1>
              
              {/* Functional Search Bar */}
              <div className="relative max-w-2xl mx-auto group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Icon 
                    type="search" 
                    className={`size-5 transition-colors duration-300 ${searchQuery ? "text-emerald-500" : "text-gray-400"}`} 
                  />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for modules, features, or guides..."
                  className="w-full pl-14 pr-14 py-4 bg-white border border-gray-400 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-200 transition-all duration-300 placeholder:text-gray-300 text-dark font-medium"
                />
                <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Icon type="close" className="size-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Documentation Sections */}
            {filteredCategories.length > 0 ? (
              <motion.div
                key={searchQuery ? "search-results" : "all-results"}
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto"
              >
                {filteredCategories.map((category) => (
                  <motion.section key={category.title} variants={fadeInUp} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gray-900 rounded-xl shadow-lg shadow-gray-900/10">
                        <Icon type={category.icon} className="size-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      <div className="flex-grow border-t border-gray-100" />
                      <span className="text-xs font-bold text-gray-300">{category.items.length} Items</span>
                    </div>
                    
                    <div className="grid gap-4">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className="group p-5 bg-white border border-gray-400 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-start gap-4"
                        >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <Icon type={item.icon} className="size-5 text-emerald-600 group-hover:text-white" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                          <Icon type="arrow_forward" className="size-5 text-gray-300 mt-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-emerald-500 transition-all duration-300" />
                        </div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching documentation</h3>
                <p className="text-dark mb-8 max-w-sm mx-auto">
                  We couldn't find anything matching "{searchQuery}". Try using broader terms or check our core modules.
                </p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}

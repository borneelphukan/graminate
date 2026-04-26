import { Icon, Button, Table } from "@graminate/ui";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import TaskBoard from "@/components/tasks/TaskBoard";
import { useTableActions } from "@/hooks/useTableActions";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import { PAGINATION_ITEMS } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import {
  useSubTypeFinancialData,
  DailyFinancialEntry,
  ExpenseCategoryConfig,
} from "@/hooks/finance";
import ApicultureForm from "@/components/form/apiculture/ApicultureForm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type View = "apiculture";

type ApicultureRecord = {
  apiary_id: number;
  user_id: number;
  apiary_name: string;
  number_of_hives: number;
  area: number | null;
  created_at: string;
};

const FINANCIAL_METRICS = [
  "Revenue",
  "COGS",
  "Gross Profit",
  "Expenses",
  "Net Profit",
] as const;

const TARGET_APICULTURE_SUB_TYPE = "Apiculture";

const APICULTURE_EXPENSE_CONFIG: ExpenseCategoryConfig = {
  detailedCategories: {
    "Goods & Services": [
      "Beehives",
      "Queen Bees",
      "Sugar Feed",
      "Pollen Patties",
      "Medication",
    ],
    "Utility Expenses": [
      "Equipment (Smoker, Hive Tool)",
      "Protective Gear",
      "Transportation",
      "Licenses & Permits",
      "Others",
    ],
  },
  expenseTypeMap: {
    COGS: "Goods & Services",
    OPERATING_EXPENSES: "Utility Expenses",
  },
};

const Apiculture = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserId ? parseInt(parsedUserId, 10) : undefined;
  const [showFinancials, setShowFinancials] = useState(true);
  const currentDate = useMemo(() => new Date(), []);
  const currentView: View | "tasks" = router.query.view === "apiculture" ? "apiculture" : "tasks";
  const { handleDeleteRows } = useTableActions("apiculture");

  const [apicultureRecords, setApicultureRecords] = useState<
    ApicultureRecord[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingApiculture, setLoadingApiculture] = useState(true);
  const [editingApiary, setEditingApiary] = useState<ApicultureRecord | null>(
    null
  );

  const { fullHistoricalData, isLoadingFinancials } = useSubTypeFinancialData({
    userId: parsedUserId,
    targetSubType: TARGET_APICULTURE_SUB_TYPE,
    expenseCategoryConfig: APICULTURE_EXPENSE_CONFIG,
  });

  const fetchApiculture = useCallback(async () => {
    if (!parsedUserId) {
      setLoadingApiculture(false);
      return;
    }
    setLoadingApiculture(true);
    try {
      const response = await axiosInstance.get(
        `/apiculture/user/${encodeURIComponent(parsedUserId)}`
      );
      setApicultureRecords(response.data.apiaries || []);
    } catch (error: unknown) {
      console.error(
        error instanceof Error
          ? `Error fetching apiculture data: ${error.message}`
          : "Unknown error fetching apiculture data"
      );
      setApicultureRecords([]);
    } finally {
      setLoadingApiculture(false);
    }
  }, [parsedUserId]);

  useEffect(() => {
    if (router.isReady) {
      fetchApiculture();
    }
  }, [router.isReady, fetchApiculture]);

  const apicultureCardData = useMemo(() => {
    if (fullHistoricalData.length === 0 && !isLoadingFinancials) {
      return FINANCIAL_METRICS.map((metric) => ({
        title: `${TARGET_APICULTURE_SUB_TYPE} ${metric}`,
        value: 0,
        icon: "attach_money",
        bgColor: "bg-gray-300 dark:bg-gray-700",
        iconValueColor: "text-gray-500 dark:text-gray-400",
      }));
    }
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let apicultureRevenue = 0,
      apicultureCogs = 0,
      apicultureExpenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (
        isWithinInterval(entry.date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        apicultureRevenue +=
          entry.revenue.breakdown.find(
            (b) => b.name === TARGET_APICULTURE_SUB_TYPE
          )?.value || 0;
        apicultureCogs +=
          entry.cogs.breakdown.find(
            (b) => b.name === TARGET_APICULTURE_SUB_TYPE
          )?.value || 0;
        apicultureExpenses +=
          entry.expenses.breakdown.find(
            (b) => b.name === TARGET_APICULTURE_SUB_TYPE
          )?.value || 0;
      }
    });
    const apicultureGrossProfit = apicultureRevenue - apicultureCogs;
    const apicultureNetProfit = apicultureGrossProfit - apicultureExpenses;

    return [
      {
        title: `${TARGET_APICULTURE_SUB_TYPE} Revenue`,
        value: apicultureRevenue,
        icon: "attach_money",
        bgColor: "bg-green-300 dark:bg-green-800",
        iconValueColor: "text-green-200 dark:text-green-200",
      },
      {
        title: `${TARGET_APICULTURE_SUB_TYPE} COGS`,
        value: apicultureCogs,
        icon: "shopping_cart",
        bgColor: "bg-yellow-300 dark:bg-yellow-100",
        iconValueColor: "text-yellow-200",
      },
      {
        title: `${TARGET_APICULTURE_SUB_TYPE} Gross Profit`,
        value: apicultureGrossProfit,
        icon: "pie_chart",
        bgColor: "bg-cyan-300 dark:bg-cyan-100",
        iconValueColor: "text-cyan-200",
      },
      {
        title: `${TARGET_APICULTURE_SUB_TYPE} Expenses`,
        value: apicultureExpenses,
        icon: "credit_card",
        bgColor: "bg-red-300 dark:bg-red-100",
        iconValueColor: "text-red-200",
      },
      {
        title: `${TARGET_APICULTURE_SUB_TYPE} Net Profit`,
        value: apicultureNetProfit,
        icon: "savings",
        bgColor: "bg-blue-300 dark:bg-blue-100",
        iconValueColor: "text-blue-200",
      },
    ];
  }, [fullHistoricalData, currentDate, isLoadingFinancials]);

  const filteredApicultureRecords = useMemo(() => {
    if (!searchQuery) return apicultureRecords;
    return apicultureRecords.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      return item.apiary_name.toLowerCase().includes(searchTerm);
    });
  }, [apicultureRecords, searchQuery]);

  const handleApiaryFormSuccess = () => {
    setIsSidebarOpen(false);
    setEditingApiary(null);
    fetchApiculture();
  };

  const tableData = useMemo(
    () => ({
      columns: [
        "#",
        "Bee Yard Name",
        "Area (sq. m)",
        "No. of Hives",
        "Created At",
      ],
      rows: filteredApicultureRecords.map((item) => [
        item.apiary_id,
        item.apiary_name,
        item.area != null ? `${item.area}` : "N/A",
        item.number_of_hives,
        new Date(item.created_at).toLocaleDateString(),
      ]),
    }),
    [filteredApicultureRecords]
  );

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {currentView === "tasks" ? "Tasks" : "Apiaries"}</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-stretch gap-12">
        {/* Operations Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-500 dark:border-gray-700 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                Apiary Dashboard
              </h1>
              <p className="text-sm text-dark dark:text-light mt-1">
                {loadingApiculture
                  ? "Loading hive records..."
                  : `Managing ${filteredApicultureRecords.length} active apiaries`}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
               <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowFinancials(!showFinancials)}
              >
                <Icon
                  type={showFinancials ? "expand_less" : "expand_more"}
                />
                {showFinancials ? "Collapse Finances" : "View Finances"}
              </button>
              <Button
                label="New Apiary"
                variant="primary"
                icon={{ left: "add" }}
                onClick={() => {
                  setEditingApiary(null);
                  setIsSidebarOpen(true);
                }}
              />
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showFinancials
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {isLoadingFinancials ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-2">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-36 flex items-center justify-center animate-pulse"
                    >
                      <Loader />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-2">
                {apicultureCardData.map((card, index) => (
                  <BudgetCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    date={currentDate}
                    icon={card.icon}
                    bgColor={card.bgColor}
                    iconValueColor={card.iconValueColor}
                  />
                ))}
              </div>
            )}
          </div>

          {numericUserId && !isNaN(numericUserId) && (
            <div className="w-full">
              <WarehouseWidget serviceName="Apiculture" />
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            <Table
              data={tableData}
              filteredRows={tableData.rows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              paginationItems={PAGINATION_ITEMS}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalRecordCount={filteredApicultureRecords.length}
              onRowClick={(row) => {
                const apiaryId = row[0] as number;
                const apiaryName = row[1] as string;
                if (parsedUserId && apiaryId) {
                  router.push({
                    pathname: `/${parsedUserId}/apiculture/${apiaryId}`,
                    query: { apiaryName: encodeURIComponent(apiaryName) },
                  });
                }
              }}
              view="apiculture"
              loading={loadingApiculture && apicultureRecords.length > 0}
              hideChecks={false}
              download={true}
              onDeleteRows={handleDeleteRows}
            />
          </div>
        </section>

        {/* Projects Section */}
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
              Your Apiculture Tasks
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              All your apiculture tasks visualized
            </p>
          </div>
          <div className="rounded-3xl p-6 border border-gray-400 dark:border-gray-700 shadow-xs">
             <TaskBoard projectTitle="Apiculture" userId={parsedUserId as string} />
          </div>
        </section>

        {isSidebarOpen && (
          <ApicultureForm
            onClose={() => {
              setIsSidebarOpen(false);
              setEditingApiary(null);
            }}
            formTitle={editingApiary ? "Edit Bee Yard" : "Add New Bee Yard"}
            apiaryToEdit={editingApiary}
            onApiaryUpdateOrAdd={handleApiaryFormSuccess}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default Apiculture;

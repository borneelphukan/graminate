import { Icon, Button, Table, SegmentedControl } from "@graminate/ui";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import { PAGINATION_ITEMS, POULTRY_EXPENSE_CONFIG } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import FlockForm from "@/components/form/poultry/FlockForm";
import { useTableActions } from "@/hooks/useTableActions";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import InventoryStockCard from "@/components/cards/InventoryStock";
import TaskBoard from "@/components/tasks/TaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";


import { useSubTypeFinancialData, DailyFinancialEntry } from "@/hooks/finance";

type View = "flock";

type FlockApiData = {
  flock_id: number;
  user_id?: number;
  flock_name: string;
  flock_type: string;
  quantity: number;
  created_at?: string;
  breed?: string;
  source?: string;
  housing_type?: string;
  notes?: string;
};

const FINANCIAL_METRICS = [
  "Revenue",
  "COGS",
  "Gross Profit",
  "Expenses",
  "Net Profit",
] as const;

const TARGET_POULTRY_SUB_TYPE = "Poultry";

const Poultry = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserId ? parseInt(parsedUserId, 10) : undefined;
  const currentView: View | "tasks" = router.query.view === "flock" ? "flock" : "tasks";

  const [flockRecords, setFlockRecords] = useState<FlockApiData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFlocks, setLoadingFlocks] = useState(true);
  const [editingFlock, setEditingFlock] = useState<FlockApiData | null>(null);

  const [showFinancials, setShowFinancials] = useState(true);
  const currentDate = useMemo(() => new Date(), []);
  const { handleDeleteRows } = useTableActions("flock");

  const { fullHistoricalData, isLoadingFinancials } = useSubTypeFinancialData({
    userId: parsedUserId,
    targetSubType: TARGET_POULTRY_SUB_TYPE,
    expenseCategoryConfig: POULTRY_EXPENSE_CONFIG,
  });

  const fetchFlocks = useCallback(async () => {
    if (!parsedUserId) {
      setLoadingFlocks(false);
      return;
    }
    setLoadingFlocks(true);
    try {
      const response = await axiosInstance.get(
        `/flock/user/${encodeURIComponent(parsedUserId)}`
      );
      setFlockRecords(response.data.flocks || []);
    } catch (error: unknown) {
      console.error(
        error instanceof Error
          ? `Error fetching flock data: ${error.message}`
          : "Unknown error fetching flock data"
      );
      setFlockRecords([]);
    } finally {
      setLoadingFlocks(false);
    }
  }, [parsedUserId]);

  useEffect(() => {
    if (router.isReady) {
      fetchFlocks();
    }
  }, [router.isReady, fetchFlocks]);

  const poultryCardData = useMemo(() => {
    if (fullHistoricalData.length === 0 && !isLoadingFinancials) {
      return FINANCIAL_METRICS.map((metric) => ({
        title: `${TARGET_POULTRY_SUB_TYPE} ${metric}`,
        value: 0,
        icon: "attach_money",
        bgColor: "bg-gray-300 dark:bg-gray-700",
        iconValueColor: "text-gray-500 dark:text-gray-400",
      }));
    }
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let poultryRevenue = 0,
      poultryCogs = 0,
      poultryExpenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (
        isWithinInterval(entry.date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        poultryRevenue +=
          entry.revenue.breakdown.find(
            (b) => b.name === TARGET_POULTRY_SUB_TYPE
          )?.value || 0;
        poultryCogs +=
          entry.cogs.breakdown.find((b) => b.name === TARGET_POULTRY_SUB_TYPE)
            ?.value || 0;
        poultryExpenses +=
          entry.expenses.breakdown.find(
            (b) => b.name === TARGET_POULTRY_SUB_TYPE
          )?.value || 0;
      }
    });
    const poultryGrossProfit = poultryRevenue - poultryCogs;
    const poultryNetProfit = poultryGrossProfit - poultryExpenses;

    return [
      {
        title: `${TARGET_POULTRY_SUB_TYPE} Revenue`,
        value: poultryRevenue,
        icon: "attach_money",
        bgColor: "bg-green-300 dark:bg-green-800",
        iconValueColor: "text-green-200 dark:text-green-200",
      },
      {
        title: `${TARGET_POULTRY_SUB_TYPE} COGS`,
        value: poultryCogs,
        icon: "shopping_cart",
        bgColor: "bg-yellow-300 dark:bg-yellow-100",
        iconValueColor: "text-yellow-200",
      },
      {
        title: `${TARGET_POULTRY_SUB_TYPE} Gross Profit`,
        value: poultryGrossProfit,
        icon: "pie_chart",
        bgColor: "bg-cyan-300 dark:bg-cyan-600",
        iconValueColor: "text-cyan-200",
      },
      {
        title: `${TARGET_POULTRY_SUB_TYPE} Expenses`,
        value: poultryExpenses,
        icon: "credit_card",
        bgColor: "bg-red-300 dark:bg-red-100",
        iconValueColor: "text-red-200",
      },
      {
        title: `${TARGET_POULTRY_SUB_TYPE} Net Profit`,
        value: poultryNetProfit,
        icon: "savings",
        bgColor: "bg-blue-300 dark:bg-blue-100",
        iconValueColor: "text-blue-200 dark:text-blue-200",
      },
    ];
  }, [fullHistoricalData, currentDate, isLoadingFinancials]);

  const filteredFlockRecords = useMemo(() => {
    if (!searchQuery) return flockRecords;
    return flockRecords.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        item.flock_name.toLowerCase().includes(searchTerm) ||
        item.flock_type.toLowerCase().includes(searchTerm) ||
        String(item.quantity).toLowerCase().includes(searchTerm) ||
        (item.breed && item.breed.toLowerCase().includes(searchTerm)) ||
        (item.source && item.source.toLowerCase().includes(searchTerm)) ||
        (item.housing_type &&
          item.housing_type.toLowerCase().includes(searchTerm))
      );
    });
  }, [flockRecords, searchQuery]);

  const handleFlockFormSuccess = () => {
    setIsSidebarOpen(false);
    setEditingFlock(null);
    fetchFlocks();
  };

  const tableData = useMemo(
    () => ({
      columns: ["#", "Flock Name", "Type", "Qty", "Breed", "Source", "Housing"],
      rows: filteredFlockRecords.map((item) => [
        item.flock_id,
        item.flock_name,
        item.flock_type,
        item.quantity,
        item.breed || "N/A",
        item.source || "N/A",
        item.housing_type || "N/A",
      ]),
    }),
    [filteredFlockRecords]
  );

  if (!parsedUserId && !loadingFlocks && !isLoadingFinancials) {
    return (
      <PlatformLayout>
        <Head>
          <title>Graminate | Flocks</title>
        </Head>
        <div className="container mx-auto p-4 text-center">
          <p className="text-red-200">User ID not found. Cannot load page.</p>
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {currentView === "tasks" ? "Tasks" : "Flocks"}</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-stretch gap-12">
        {/* Operations Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-400 dark:border-gray-600 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                Poultry Operations
              </h1>
              <p className="text-sm text-dark dark:text-light mt-1">
                {loadingFlocks
                  ? "Syncing flock data..."
                  : `Managing ${filteredFlockRecords.length} active flock cycles`}
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
                label="New Flock"
                variant="primary"
                icon={{ left: "add" }}
                onClick={() => {
                  setEditingFlock(null);
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
                {poultryCardData.map((card, index) => (
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
              <WarehouseWidget serviceName="Poultry" />
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-400 dark:border-gray-800 overflow-hidden">
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
              totalRecordCount={filteredFlockRecords.length}
              onRowClick={(row) => {
                const flockId = row[0] as number;
                const flockName = row[1] as string;
                if (parsedUserId && flockId) {
                  router.push({
                    pathname: `/${parsedUserId}/poultry/${flockId}`,
                    query: { flockName: encodeURIComponent(flockName) },
                  });
                }
              }}
              view="flock"
              loading={loadingFlocks && flockRecords.length > 0}
              onDeleteRows={handleDeleteRows}
            />
          </div>
        </section>

        {/* Projects Section */}
        <section className="flex flex-col gap-6 pt-8 border-t border-gray-400 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
              Your Poultry Tasks
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              All your poultry tasks visualized
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl p-6 border border-gray-400 dark:border-gray-800">
            <TaskBoard projectTitle="Poultry" userId={parsedUserId as string} />
          </div>
        </section>

        {isSidebarOpen && (
          <FlockForm
            onClose={() => {
              setIsSidebarOpen(false);
              setEditingFlock(null);
            }}
            formTitle={editingFlock ? "Edit Flock" : "Add Flock"}
            onFlockUpdateOrAdd={handleFlockFormSuccess}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default Poultry;

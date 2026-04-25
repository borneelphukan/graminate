import { Icon, Button, Table } from "@graminate/ui";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import { PAGINATION_ITEMS, POULTRY_EXPENSE_CONFIG } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import { useTableActions } from "@/hooks/useTableActions";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import { useSubTypeFinancialData, DailyFinancialEntry } from "@/hooks/finance";
import CattleForm from "@/components/form/CattleForm";
import TaskBoard from "@/components/tasks/TaskBoard";
import InventoryStockCard from "@/components/cards/InventoryStock";
import WarehouseWidget from "@/components/cards/WarehouseWidget";

type View = "cattle";

type CattleRearingRecord = {
  cattle_id: number;
  user_id: number;
  cattle_name: string;
  cattle_type: string | null;
  number_of_animals: number;
  purpose: string | null;
  created_at: string;
};

const FINANCIAL_METRICS = [
  "Revenue",
  "COGS",
  "Gross Profit",
  "Expenses",
  "Net Profit",
] as const;

const TARGET_CATTLE_SUB_TYPE = "Cattle Rearing";

const CattleRearing = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const numericUserId = parsedUserId ? parseInt(parsedUserId, 10) : undefined;
  const currentView: View | "tasks" = router.query.view === "cattle" ? "cattle" : "tasks";

  const [cattleRecords, setCattleRecords] = useState<CattleRearingRecord[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCattle, setLoadingCattle] = useState(true);
  const [editingCattle, setEditingCattle] =
    useState<CattleRearingRecord | null>(null);

  const [showFinancials, setShowFinancials] = useState(true);
  const currentDate = useMemo(() => new Date(), []);
  const { handleDeleteRows } = useTableActions("cattle");

  const { fullHistoricalData, isLoadingFinancials } = useSubTypeFinancialData({
    userId: parsedUserId,
    targetSubType: TARGET_CATTLE_SUB_TYPE,
    expenseCategoryConfig: POULTRY_EXPENSE_CONFIG,
  });

  const fetchCattle = useCallback(async () => {
    if (!parsedUserId) {
      setLoadingCattle(false);
      return;
    }
    setLoadingCattle(true);
    try {
      const response = await axiosInstance.get(
        `/cattle-rearing/user/${encodeURIComponent(parsedUserId)}`
      );
      setCattleRecords(response.data.cattleRearings || []);
    } catch (error: unknown) {
      console.error(
        error instanceof Error
          ? `Error fetching cattle data: ${error.message}`
          : "Unknown error fetching cattle data"
      );
      setCattleRecords([]);
    } finally {
      setLoadingCattle(false);
    }
  }, [parsedUserId]);

  useEffect(() => {
    if (router.isReady) {
      fetchCattle();
    }
  }, [router.isReady, fetchCattle]);

  const cattleCardData = useMemo(() => {
    if (fullHistoricalData.length === 0 && !isLoadingFinancials) {
      return FINANCIAL_METRICS.map((metric) => ({
        title: `${TARGET_CATTLE_SUB_TYPE} ${metric}`,
        value: 0,
        icon: "attach_money",
        bgColor: "bg-gray-300 dark:bg-gray-700",
        iconValueColor: "text-gray-500 dark:text-gray-400",
      }));
    }
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let cattleRevenue = 0,
      cattleCogs = 0,
      cattleExpenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (
        isWithinInterval(entry.date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        cattleRevenue +=
          entry.revenue.breakdown.find((b) => b.name === TARGET_CATTLE_SUB_TYPE)
            ?.value || 0;
        cattleCogs +=
          entry.cogs.breakdown.find((b) => b.name === TARGET_CATTLE_SUB_TYPE)
            ?.value || 0;
        cattleExpenses +=
          entry.expenses.breakdown.find(
            (b) => b.name === TARGET_CATTLE_SUB_TYPE
          )?.value || 0;
      }
    });
    const cattleGrossProfit = cattleRevenue - cattleCogs;
    const cattleNetProfit = cattleGrossProfit - cattleExpenses;

    return [
      {
        title: `${TARGET_CATTLE_SUB_TYPE} Revenue`,
        value: cattleRevenue,
        icon: "attach_money",
        bgColor: "bg-green-300 dark:bg-green-800",
        iconValueColor: "text-green-200 dark:text-green-200",
      },
      {
        title: `${TARGET_CATTLE_SUB_TYPE} COGS`,
        value: cattleCogs,
        icon: "shopping_cart",
        bgColor: "bg-yellow-300 dark:bg-yellow-100",
        iconValueColor: "text-yellow-200",
      },
      {
        title: `${TARGET_CATTLE_SUB_TYPE} Gross Profit`,
        value: cattleGrossProfit,
        icon: "pie_chart",
        bgColor: "bg-cyan-300 dark:bg-cyan-600",
        iconValueColor: "text-cyan-200",
      },
      {
        title: `${TARGET_CATTLE_SUB_TYPE} Expenses`,
        value: cattleExpenses,
        icon: "credit_card",
        bgColor: "bg-red-300 dark:bg-red-100",
        iconValueColor: "text-red-200",
      },
      {
        title: `${TARGET_CATTLE_SUB_TYPE} Net Profit`,
        value: cattleNetProfit,
        icon: "savings",
        bgColor: "bg-blue-300 dark:bg-blue-100",
        iconValueColor: "text-blue-200 dark:text-blue-200",
      },
    ];
  }, [fullHistoricalData, currentDate, isLoadingFinancials]);

  const filteredCattleRecords = useMemo(() => {
    if (!searchQuery) return cattleRecords;
    return cattleRecords.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        item.cattle_name.toLowerCase().includes(searchTerm) ||
        (item.cattle_type &&
          item.cattle_type.toLowerCase().includes(searchTerm)) ||
        (item.purpose && item.purpose.toLowerCase().includes(searchTerm))
      );
    });
  }, [cattleRecords, searchQuery]);

  const handleCattleFormSuccess = () => {
    setIsSidebarOpen(false);
    setEditingCattle(null);
    fetchCattle();
  };

  const tableData = useMemo(
    () => ({
      columns: ["#", "Name", "Type", "No. of Animals", "Purpose", "Created At"],
      rows: filteredCattleRecords.map((item) => [
        item.cattle_id,
        item.cattle_name,
        item.cattle_type || "N/A",
        item.number_of_animals,
        item.purpose || "N/A",
        new Date(item.created_at).toLocaleDateString(),
      ]),
    }),
    [filteredCattleRecords]
  );

  if (!parsedUserId && !loadingCattle && !isLoadingFinancials) {
    return (
      <PlatformLayout>
        <Head>
          <title>Graminate | Cattle Rearing</title>
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
        <title>Graminate | {currentView === "tasks" ? "Tasks" : "Cattle Rearing"}</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-stretch gap-12">
        {/* Operations Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-400 dark:border-gray-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                Cattle Management
              </h1>
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
                label="Add Herd"
                variant="primary"
                icon={{ left: "add" }}
                onClick={() => {
                  setEditingCattle(null);
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
                {cattleCardData.map((card, index) => (
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
              <WarehouseWidget serviceName="Cattle Rearing" />
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
              totalRecordCount={filteredCattleRecords.length}
              onRowClick={(row) => {
                const cattleId = row[0] as number;
                const cattleName = row[1] as string;
                if (parsedUserId && cattleId) {
                  router.push({
                    pathname: `/${parsedUserId}/cattle_rearing/${cattleId}`,
                    query: { cattleName: encodeURIComponent(cattleName) },
                  });
                }
              }}
              view="cattle"
              loading={loadingCattle && cattleRecords.length > 0}
              hideChecks={false}
              download={true}
              onDeleteRows={handleDeleteRows}
            />
          </div>
        </section>

        {/* Projects Section */}
        <section className="flex flex-col gap-6 pt-8 border-t border-gray-400 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
              Your Cattle Rearing Tasks
            </h2>
            <p className="text-sm text-dark dark:text-light mt-1">
              All your cattle rearing tasks visualized
            </p>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl p-6 border border-gray-400 dark:border-gray-800">
            <TaskBoard projectTitle="Cattle Rearing" userId={parsedUserId as string} />
          </div>
        </section>

        {isSidebarOpen && (
          <CattleForm
            onClose={() => {
              setIsSidebarOpen(false);
              setEditingCattle(null);
            }}
            formTitle={editingCattle ? "Edit Cattle" : "Add Cattle"}
            onCattleUpdateOrAdd={handleCattleFormSuccess}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default CattleRearing;

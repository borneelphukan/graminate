import { Icon, Button, Table } from "@graminate/ui";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import PlatformLayout from "@/layout/PlatformLayout";
import { PAGINATION_ITEMS, FLORICULTURE_EXPENSE_CONFIG } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import { useTableActions } from "@/hooks/useTableActions";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import { useSubTypeFinancialData, DailyFinancialEntry } from "@/hooks/finance";
import FloricultureForm, { FloricultureData } from "@/components/form/floriculture/FloricultureForm";
import TaskBoard from "@/components/tasks/TaskBoard";
import WarehouseWidget from "@/components/cards/WarehouseWidget";
import WaterCalendar from "@/components/floriculture/WaterCalendar";

type View = "floriculture";

const FINANCIAL_METRICS = [
  "Revenue",
  "COGS",
  "Gross Profit",
  "Expenses",
  "Net Profit",
] as const;

const TARGET_SUB_TYPE = "Floriculture";

const Floriculture = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const currentView: View | "tasks" = router.query.view === "floriculture" ? "floriculture" : "tasks";

  const [records, setRecords] = useState<FloricultureData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<FloricultureData | null>(null);

  const [showFinancials, setShowFinancials] = useState(true);
  const currentDate = useMemo(() => new Date(), []);
  const { handleDeleteRows } = useTableActions("floriculture");

  const { fullHistoricalData, isLoadingFinancials } = useSubTypeFinancialData({
    userId: parsedUserId,
    targetSubType: TARGET_SUB_TYPE,
    expenseCategoryConfig: FLORICULTURE_EXPENSE_CONFIG,
  });

  const fetchRecords = useCallback(async () => {
    if (!parsedUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/floriculture/user/${encodeURIComponent(parsedUserId)}`
      );
      setRecords(response.data.floricultures || []);
    } catch (error: unknown) {
      console.error("Error fetching floriculture data:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [parsedUserId]);

  useEffect(() => {
    if (router.isReady) {
      fetchRecords();
    }
  }, [router.isReady, fetchRecords]);

  const financialCardData = useMemo(() => {
    if (fullHistoricalData.length === 0 && !isLoadingFinancials) {
      return FINANCIAL_METRICS.map((metric) => ({
        title: `${TARGET_SUB_TYPE} ${metric}`,
        value: 0,
        icon: "attach_money",
        bgColor: "bg-gray-300 dark:bg-gray-700",
        iconValueColor: "text-gray-500 dark:text-gray-400",
      }));
    }
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let revenue = 0, cogs = 0, expenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (isWithinInterval(entry.date, { start: currentMonthStart, end: currentMonthEnd })) {
        revenue += entry.revenue.breakdown.find((b) => b.name === TARGET_SUB_TYPE)?.value || 0;
        cogs += entry.cogs.breakdown.find((b) => b.name === TARGET_SUB_TYPE)?.value || 0;
        expenses += entry.expenses.breakdown.find((b) => b.name === TARGET_SUB_TYPE)?.value || 0;
      }
    });
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    return [
      { title: `${TARGET_SUB_TYPE} Revenue`, value: revenue, icon: "attach_money", bgColor: "bg-green-300 dark:bg-green-800", iconValueColor: "text-green-200" },
      { title: `${TARGET_SUB_TYPE} COGS`, value: cogs, icon: "shopping_cart", bgColor: "bg-yellow-300 dark:bg-yellow-100", iconValueColor: "text-yellow-200" },
      { title: `${TARGET_SUB_TYPE} Gross Profit`, value: grossProfit, icon: "pie_chart", bgColor: "bg-cyan-300 dark:bg-cyan-600", iconValueColor: "text-cyan-200" },
      { title: `${TARGET_SUB_TYPE} Expenses`, value: expenses, icon: "credit_card", bgColor: "bg-red-300 dark:bg-red-100", iconValueColor: "text-red-200" },
      { title: `${TARGET_SUB_TYPE} Net Profit`, value: netProfit, icon: "savings", bgColor: "bg-blue-300 dark:bg-blue-100", iconValueColor: "text-blue-200" },
    ];
  }, [fullHistoricalData, currentDate, isLoadingFinancials]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const term = searchQuery.toLowerCase();
    return records.filter((item) => 
      item.flower_name.toLowerCase().includes(term) ||
      (item.flower_type && item.flower_type.toLowerCase().includes(term)) ||
      (item.method && item.method.toLowerCase().includes(term))
    );
  }, [records, searchQuery]);

  const handleFormSuccess = () => {
    setIsSidebarOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const tableData = useMemo(() => ({
    columns: ["#", "Flower Name", "Type", "Area (sq ft)", "Method", "Planting Date"],
    rows: filteredRecords.map((item) => [
      item.flower_id,
      item.flower_name,
      item.flower_type || "N/A",
      item.area || "N/A",
      item.method || "N/A",
      item.planting_date ? new Date(item.planting_date).toLocaleDateString() : "N/A",
    ]),
  }), [filteredRecords]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {currentView === "tasks" ? "Tasks" : "Floriculture"}</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4 flex flex-col items-stretch gap-12">
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-gray-400 dark:border-gray-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                Floriculture Management
              </h1>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowFinancials(!showFinancials)}
              >
                <Icon type={showFinancials ? "expand_less" : "expand_more"} />
                {showFinancials ? "Collapse Finances" : "View Finances"}
              </button>
              <Button
                label="Add Flower"
                variant="primary"
                icon={{ left: "add" }}
                onClick={() => {
                  setEditingRecord(null);
                  setIsSidebarOpen(true);
                }}
              />
            </div>
          </div>
          
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFinancials ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
            {isLoadingFinancials ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-36 flex items-center justify-center animate-pulse">
                    <Loader />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-2">
                {financialCardData.map((card, i) => (
                  <BudgetCard key={i} title={card.title} value={card.value} date={currentDate} icon={card.icon} bgColor={card.bgColor} iconValueColor={card.iconValueColor} />
                ))}
              </div>
            )}
          </div>

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
              totalRecordCount={filteredRecords.length}
              onRowClick={(row) => {
                const flowerId = row[0] as number;
                const flowerName = row[1] as string;
                if (parsedUserId && flowerId) {
                  router.push({
                    pathname: `/${parsedUserId}/floriculture/${flowerId}`,
                    query: { flowerName: encodeURIComponent(flowerName) },
                  });
                }
              }}
              view="floriculture"
              loading={loading && records.length > 0}
              hideChecks={false}
              download={true}
              onDeleteRows={handleDeleteRows}
            />
          </div>

        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 items-start !m-0 !p-0">
          <div className="flex flex-col gap-0">
            <div className="w-full">
              <WaterCalendar userId={parsedUserId as string} />
            </div>
          </div>

          <div className="flex flex-col gap-0">
            <div className="w-full">
              <WarehouseWidget serviceName="Floriculture" />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
              Task Manager
            </h2>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl p-6 border border-gray-400 dark:border-gray-800">
            <TaskBoard projectTitle="Floriculture" userId={parsedUserId as string} />
          </div>
        </section>

        {isSidebarOpen && (
          <FloricultureForm
            onClose={() => {
              setIsSidebarOpen(false);
              setEditingRecord(null);
            }}
            formTitle={editingRecord ? "Edit Flower" : "Add Flower"}
            onFlowerUpdateOrAdd={handleFormSuccess}
            flowerToEdit={editingRecord}
          />
        )}
      </div>
    </PlatformLayout>
  );
};

export default Floriculture;

import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button, Icon } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import SalesTable, {
  RowType as TableRowType,
  TableData as TableDataFormat,
} from "@/components/tables/SalesTable";
import SalesModal from "@/components/modals/SalesModal";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import { useSubTypeFinancialData, DailyFinancialEntry } from "@/hooks/finance";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { POULTRY_EXPENSE_CONFIG } from "@/constants/options";
import InfoModal from "@/components/modals/InfoModal";

type SaleRecord = {
  sales_id: number;
  user_id: number;
  sales_name?: string;
  sales_date: string;
  occupation?: string;
  items_sold: string[];
  quantities_sold: number[];
  prices_per_unit?: number[];
  quantity_unit?: string;
  invoice_created: boolean;
  created_at: string;
};

const salesTableColumns = [
  "#",
  "Sale Name",
  "Occupation",
  "Commodity",
  "Quantities",
  "Price/Unit",
  "Sale (₹)",
  "Invoice",
  "Logged At",
];

const paginationItems = ["10 per page", "25 per page", "50 per page", "100 per page"];

const Sales = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const currentUserId = useMemo(
    () => (Array.isArray(user_id) ? user_id[0] : user_id),
    [user_id]
  );

  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [salesSearchQuery, setSalesSearchQuery] = useState("");
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [salesItemsPerPage, setSalesItemsPerPage] = useState(25);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [showFinancials, setShowFinancials] = useState(true);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  const fetchSalesData = useCallback(async () => {
    if (!currentUserId) {
      setIsSalesLoading(false);
      return;
    }
    setIsSalesLoading(true);
    try {
      const response = await axiosInstance.get<{ sales: SaleRecord[] }>(
        `/sales/user/${currentUserId}`
      );
      setSalesData(response.data.sales || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData([]);
      setInfoModal({
        isOpen: true,
        title: "Error",
        text: "Could not fetch sales data.",
        variant: "error",
      });
    } finally {
      setIsSalesLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUserId) {
        setIsUserDetailsLoading(false);
        return;
      }
      setIsUserDetailsLoading(true);
      try {
        await axiosInstance.get(`/user/${currentUserId}`);
      } catch (error) {
        console.error("Page: Error fetching user details:", error);
      } finally {
        setIsUserDetailsLoading(false);
      }
    };

    fetchUserDetails();
    fetchSalesData();
  }, [currentUserId, fetchSalesData]);

  const { fullHistoricalData } = useSubTypeFinancialData({
    userId: currentUserId,
    targetSubType: "All",
    expenseCategoryConfig: POULTRY_EXPENSE_CONFIG,
    onError: (title, text) =>
      setInfoModal({ isOpen: true, title, text, variant: "error" }),
  });

  const currentDate = useMemo(() => new Date(), []);

  const salesCardData = useMemo(() => {
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let totalRevenue = 0, totalCogs = 0, totalExpenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (isWithinInterval(entry.date, { start: currentMonthStart, end: currentMonthEnd })) {
        totalRevenue += entry.revenue.total;
        totalCogs += entry.cogs.total;
        totalExpenses += entry.expenses.total;
      }
    });

    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalExpenses;

    return [
      {
        title: "Total Revenue",
        value: totalRevenue,
        icon: "attach_money",
        bgColor: "bg-green-300 dark:bg-green-800",
        iconValueColor: "text-green-200 dark:text-green-200",
      },
      {
        title: "Gross Profit",
        value: grossProfit,
        icon: "pie_chart",
        bgColor: "bg-cyan-300 dark:bg-cyan-100",
        iconValueColor: "text-cyan-200",
      },
      {
        title: "Net Profit",
        value: netProfit,
        icon: "savings",
        bgColor: "bg-blue-300 dark:bg-blue-100",
        iconValueColor: "text-blue-200",
      },
    ];
  }, [fullHistoricalData, currentDate]);

  const filteredSalesRows = useMemo(() => {
    return salesData
      .map(
        (sale): TableRowType => [
          sale.sales_id,
          sale.sales_name || "-",
          sale.occupation || "-",
          sale.items_sold,
          sale.quantities_sold,
          sale.prices_per_unit
            ? sale.prices_per_unit.map((p) => parseFloat(String(p)).toFixed(2))
            : sale.items_sold.map(() => "-"),
          sale.prices_per_unit
            ? sale.quantities_sold.reduce(
                (sum, qty, idx) =>
                  sum +
                  qty *
                    (sale.prices_per_unit && sale.prices_per_unit[idx]
                      ? sale.prices_per_unit[idx]
                      : 0),
                0
              ).toFixed(2)
            : "-",
          sale.invoice_created,
          new Date(sale.created_at).toLocaleString(),
        ]
      )
      .filter((row) =>
        row.some((cell) => {
          if (cell === null || cell === undefined) return false;
          const cellString = Array.isArray(cell)
            ? cell.join(" ")
            : String(cell);
          return cellString
            .toLowerCase()
            .includes(salesSearchQuery.toLowerCase());
        })
      );
  }, [salesData, salesSearchQuery]);

  const salesTableDataFormatted: TableDataFormat = {
    columns: salesTableColumns,
    rows: filteredSalesRows,
  };

  const handleSaleAdded = () => {
    fetchSalesData();
    setIsSalesModalOpen(false);
  };

  const handleSalesRowClick = (row: TableRowType) => {
    console.log("Sale row clicked:", row);
  };

  const isLoading = isUserDetailsLoading || isSalesLoading;

  return (
    <>
      <Head>
        <title>Sales & Expenses | Graminate</title>
        <meta
          name="description"
          content="Track and manage your farm sales and expenses"
        />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen bg-light dark:bg-gray-900 p-4">
          {isLoading && !salesData.length ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <div>
                <header className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <h2 className="text-lg font-semibold text-dark dark:text-light">
                      Sales Records
                    </h2>
                  </div>
                  <div className="flex flex-row gap-6">
                    <div className="flex justify-end items-center">
                      <div
                        className="flex items-center cursor-pointer text-sm text-blue-200 dark:hover:text-blue-300"
                        onClick={() => setShowFinancials(!showFinancials)}
                      >
                        <Icon
                          type={showFinancials ? "expand_less" : "expand_more"}
                        />
                        {showFinancials ? "Hide Finances" : "Show Finances"}
                      </div>
                    </div>
                    <Button
                      label="Log Sales"
                      variant="primary"
                      icon={{ left: "add" }}
                      onClick={() => setIsSalesModalOpen(true)}
                    />
                  </div>
                </header>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showFinancials
                      ? "max-h-[500px] opacity-100 mb-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
                    {salesCardData.map((card, index) => (
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
                </div>

                <div className="mb-12">
                <SalesTable
                  data={salesTableDataFormatted}
                  filteredRows={filteredSalesRows}
                  currentPage={salesCurrentPage}
                  setCurrentPage={setSalesCurrentPage}
                  itemsPerPage={salesItemsPerPage}
                  setItemsPerPage={setSalesItemsPerPage}
                  paginationItems={paginationItems}
                  searchQuery={salesSearchQuery}
                  setSearchQuery={setSalesSearchQuery}
                  totalRecordCount={filteredSalesRows.length}
                  onRowClick={handleSalesRowClick}
                  view="sales"
                  loading={isSalesLoading}
                  onDataMutated={fetchSalesData}
                  download={true}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </>
        )}
        </main>
      </PlatformLayout>

      {isSalesModalOpen && currentUserId && (
        <SalesModal
          isOpen={isSalesModalOpen}
          onClose={() => setIsSalesModalOpen(false)}
          userId={currentUserId}
          onSaleAdded={handleSaleAdded}
        />
      )}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal((prev: any) => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        text={infoModal.text}
        variant={infoModal.variant}
      />
    </>
  );
};

export default Sales;

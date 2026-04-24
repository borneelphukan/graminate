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
import ExpenseModal from "@/components/modals/ExpenseModal";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import { useSubTypeFinancialData, DailyFinancialEntry } from "@/hooks/finance";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { POULTRY_EXPENSE_CONFIG } from "@/constants/options";
import Swal from "sweetalert2";

type ExpenseRecord = {
  expense_id: number;
  user_id: number;
  title: string;
  occupation?: string;
  category: string;
  expense: number;
  date_created: string;
  created_at: string;
};

const expensesTableColumns = [
  "#",
  "Title",
  "Amount (₹)",
  "Category",
  "Occupation",
  "Date",
  "Logged At",
];

const paginationItems = ["10 per page", "25 per page", "50 per page", "100 per page"];

const Expenses = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const currentUserId = useMemo(
    () => (Array.isArray(user_id) ? user_id[0] : user_id),
    [user_id]
  );

  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(true);

  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [expensesData, setExpensesData] = useState<ExpenseRecord[]>([]);
  const [expensesSearchQuery, setExpensesSearchQuery] = useState("");
  const [expensesCurrentPage, setExpensesCurrentPage] = useState(1);
  const [expensesItemsPerPage, setExpensesItemsPerPage] = useState(25);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [showFinancials, setShowFinancials] = useState(true);

  const fetchExpensesData = useCallback(async () => {
    if (!currentUserId) {
      setIsExpensesLoading(false);
      return;
    }
    setIsExpensesLoading(true);
    try {
      const response = await axiosInstance.get<{ expenses: ExpenseRecord[] }>(
        `/expenses/user/${currentUserId}`
      );
      setExpensesData(response.data.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses data:", error);
      setExpensesData([]);
      Swal.fire("Error", "Could not fetch expenses data.", "error");
    } finally {
      setIsExpensesLoading(false);
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

    fetchExpensesData();
  }, [currentUserId, fetchExpensesData]);

  const { fullHistoricalData, isLoadingFinancials: isFinancialLoading } = useSubTypeFinancialData({
    userId: currentUserId,
    targetSubType: "All", // We want global data
    expenseCategoryConfig: POULTRY_EXPENSE_CONFIG,
  });

  const currentDate = useMemo(() => new Date(), []);

  const expenseCardData = useMemo(() => {
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    let totalCogs = 0, totalExpenses = 0;

    fullHistoricalData.forEach((entry: DailyFinancialEntry) => {
      if (isWithinInterval(entry.date, { start: currentMonthStart, end: currentMonthEnd })) {
        totalCogs += entry.cogs.total;
        totalExpenses += entry.expenses.total;
      }
    });

    return [
      {
        title: "Total COGS",
        value: totalCogs,
        icon: "shopping_cart",
        bgColor: "bg-yellow-300 dark:bg-yellow-100",
        iconValueColor: "text-yellow-200",
      },
      {
        title: "Operating Expenses",
        value: totalExpenses,
        icon: "credit_card",
        bgColor: "bg-red-300 dark:bg-red-100",
        iconValueColor: "text-red-200",
      },
    ];
  }, [fullHistoricalData, currentDate]);

  const filteredExpensesRows = useMemo(() => {
    return expensesData
      .map(
        (expense): TableRowType => [
          expense.expense_id,
          expense.title,
          parseFloat(String(expense.expense)).toFixed(2),
          expense.category,
          expense.occupation || "-",
          new Date(expense.date_created).toLocaleDateString(),
          new Date(expense.created_at).toLocaleString(),
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
            .includes(expensesSearchQuery.toLowerCase());
        })
      );
  }, [expensesData, expensesSearchQuery]);

  const expensesTableDataFormatted: TableDataFormat = {
    columns: expensesTableColumns,
    rows: filteredExpensesRows,
  };

  const handleExpenseAdded = () => {
    fetchExpensesData();
    setIsExpenseModalOpen(false);
  };

  const handleExpensesRowClick = (row: TableRowType) => {
    console.log("Expense row clicked:", row);
  };

  const isLoading = isUserDetailsLoading || isExpensesLoading;

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
          {isLoading && !expensesData.length ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <div>
                <header className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <h2 className="text-lg font-semibold text-dark dark:text-light">
                      Expense Records
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
                      label="Log Cost"
                      variant="primary"
                      icon={{ left: "add" }}
                      onClick={() => setIsExpenseModalOpen(true)}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                    {expenseCardData.map((card, index) => (
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
                    data={expensesTableDataFormatted}
                    filteredRows={filteredExpensesRows}
                    currentPage={expensesCurrentPage}
                    setCurrentPage={setExpensesCurrentPage}
                    itemsPerPage={expensesItemsPerPage}
                    setItemsPerPage={setExpensesItemsPerPage}
                    paginationItems={paginationItems}
                    searchQuery={expensesSearchQuery}
                    setSearchQuery={setExpensesSearchQuery}
                    totalRecordCount={filteredExpensesRows.length}
                    onRowClick={handleExpensesRowClick}
                    view="expenses"
                    loading={isExpensesLoading}
                    onDataMutated={fetchExpensesData}
                    download={true}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </PlatformLayout>

      {isExpenseModalOpen && currentUserId && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          userId={currentUserId}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </>
  );
};

export default Expenses;

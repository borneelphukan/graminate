import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import SalesTable, {
  RowType as TableRowType,
  TableData as TableDataFormat,
} from "@/components/tables/SalesTable";
import LoanModal from "@/components/modals/LoanModal";
import BudgetCard from "@/components/cards/finance/BudgetCard";
import { useSubTypeFinancialData } from "@/hooks/finance";
import { POULTRY_EXPENSE_CONFIG } from "@/constants/options";
import Swal from "sweetalert2";

type LoanRecord = {
  loan_id: number;
  user_id: number;
  loan_name: string;
  lender: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  end_date?: string;
  status: string;
  created_at: string;
};

const loansTableColumns = [
  "#",
  "Loan Name",
  "Lender",
  "Amount (₹)",
  "Interest Rate (%)",
  "Start Date",
  "Status",
  "Logged At",
];

const paginationItems = ["10 per page", "25 per page", "50 per page", "100 per page"];

const LoansPage = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const currentUserId = useMemo(
    () => (Array.isArray(user_id) ? user_id[0] : user_id),
    [user_id]
  );

  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(true);
  const [isLoansLoading, setIsLoansLoading] = useState(true);
  const [loansData, setLoansData] = useState<LoanRecord[]>([]);
  const [loansSearchQuery, setLoansSearchQuery] = useState("");
  const [loansCurrentPage, setLoansCurrentPage] = useState(1);
  const [loansItemsPerPage, setLoansItemsPerPage] = useState(25);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  const fetchLoansData = useCallback(async () => {
    if (!currentUserId) {
      setIsLoansLoading(false);
      return;
    }
    setIsLoansLoading(true);
    try {
      const response = await axiosInstance.get<LoanRecord[]>(
        `/loans/user/${currentUserId}`
      );
      setLoansData(response.data || []);
    } catch (error) {
      console.error("Error fetching loans data:", error);
      setLoansData([]);
      Swal.fire("Error", "Could not fetch loans data.", "error");
    } finally {
      setIsLoansLoading(false);
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
    fetchLoansData();
  }, [currentUserId, fetchLoansData]);

  const currentDate = useMemo(() => new Date(), []);

  const loanCardData = useMemo(() => {
    const totalOutstanding = loansData.reduce((sum, loan) => sum + Number(loan.amount), 0);
    const activeLoans = loansData.filter(l => l.status === "Active").length;

    return [
      {
        title: "Total Debt",
        value: totalOutstanding,
        icon: "account_balance",
        bgColor: "bg-red-300 dark:bg-red-100",
        iconValueColor: "text-red-200",
      },
      {
        title: "Active Loans",
        value: activeLoans,
        icon: "assignment",
        bgColor: "bg-blue-300 dark:bg-blue-100",
        iconValueColor: "text-blue-200",
      },
    ];
  }, [loansData]);

  const filteredLoansRows = useMemo(() => {
    return loansData
      .map(
        (loan): TableRowType => [
          loan.loan_id,
          loan.loan_name,
          loan.lender,
          parseFloat(String(loan.amount)).toFixed(2),
          loan.interest_rate,
          new Date(loan.start_date).toLocaleDateString(),
          loan.status,
          new Date(loan.created_at).toLocaleString(),
        ]
      )
      .filter((row) =>
        row.some((cell) => {
          if (cell === null || cell === undefined) return false;
          const cellString = String(cell);
          return cellString
            .toLowerCase()
            .includes(loansSearchQuery.toLowerCase());
        })
      );
  }, [loansData, loansSearchQuery]);

  const loansTableDataFormatted: TableDataFormat = {
    columns: loansTableColumns,
    rows: filteredLoansRows,
  };

  const handleLoanAdded = () => {
    fetchLoansData();
    setIsLoanModalOpen(false);
  };

  const isLoading = isUserDetailsLoading || isLoansLoading;

  return (
    <>
      <Head>
        <title>Loans Management | Graminate</title>
        <meta
          name="description"
          content="Manage and track your farm loans and liabilities"
        />
      </Head>
      <PlatformLayout>
        <main className="min-h-screen bg-light dark:bg-gray-900 p-4">
          {isLoading && !loansData.length ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              <div>
                <header className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <h2 className="text-lg font-semibold text-dark dark:text-light">
                      Loan Records
                    </h2>
                  </div>
                  <div className="flex flex-row gap-6">
                    <Button
                      label="Log Loan"
                      variant="primary"
                      icon={{ left: "add" }}
                      onClick={() => setIsLoanModalOpen(true)}
                    />
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2 mb-6">
                  {loanCardData.map((card, index) => (
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

                <div className="mb-12">
                  <SalesTable
                    data={loansTableDataFormatted}
                    filteredRows={filteredLoansRows}
                    currentPage={loansCurrentPage}
                    setCurrentPage={setLoansCurrentPage}
                    itemsPerPage={loansItemsPerPage}
                    setItemsPerPage={setLoansItemsPerPage}
                    paginationItems={paginationItems}
                    searchQuery={loansSearchQuery}
                    setSearchQuery={setLoansSearchQuery}
                    totalRecordCount={filteredLoansRows.length}
                    view="loans"
                    loading={isLoansLoading}
                    onDataMutated={fetchLoansData}
                    download={true}
                    reset={true}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </PlatformLayout>

      {isLoanModalOpen && currentUserId && (
        <LoanModal
          isOpen={isLoanModalOpen}
          onClose={() => setIsLoanModalOpen(false)}
          onSuccess={handleLoanAdded}
        />
      )}
    </>
  );
};

export default LoansPage;

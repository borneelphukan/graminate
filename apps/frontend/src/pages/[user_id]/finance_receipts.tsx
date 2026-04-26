import { Icon, Button, Table } from "@graminate/ui";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { PAGINATION_ITEMS } from "@/constants/options";
import axiosInstance from "@/lib/utils/axiosInstance";
import ReceiptForm from "@/components/form/crm/ReceiptForm";
import { useTableActions } from "@/hooks/useTableActions";
import {
  useUserPreferences,
  SupportedLanguage,
} from "@/contexts/UserPreferencesContext";

type Receipt = {
  invoice_id: number;
  title: string;
  bill_to: string;
  due_date: string;
  receipt_date: string;
  payment_terms?: string;
  notes?: string;
  tax?: number;
  discount?: number;
  shipping?: number;
  receipt_number?: string;
  issued_date?: string;
  bill_to_address_line1?: string;
  bill_to_address_line2?: string;
  bill_to_city?: string;
  bill_to_state?: string;
  bill_to_postal_code?: string;
  bill_to_country?: string;
};

const mapSupportedLanguageToLocale = (lang: SupportedLanguage): string => {
  switch (lang) {
    case "English":
      return "en";
    case "Hindi":
      return "hi";
    case "Assamese":
      return "as";
    default:
      return "en";
  }
};

const FinanceReceipts = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const { timeFormat, language: currentLanguage } = useUserPreferences();

  const [loading, setLoading] = useState(true);
  const [receiptsData, setReceiptsData] = useState<Receipt[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClosePanelAnimation = useCallback(() => {
    setAnimate(false);
    setTimeout(() => setIsSidebarOpen(false), 300);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      setAnimate(true);
      document.body.classList.add("overflow-hidden");
      return () => {
        document.body.classList.remove("overflow-hidden");
      };
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(event.target as Node)
        ) {
          handleClosePanelAnimation();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSidebarOpen, handleClosePanelAnimation]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!user_id) return;
    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;
    setLoading(true);
    try {
      const res = await axiosInstance.get<{ receipts: Receipt[] }>(
        `/receipts/${userIdString}`
      );
      setReceiptsData(res.data.receipts || []);
    } catch {
      setReceiptsData([]);
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    if (router.isReady) fetchData();
  }, [router.isReady, fetchData]);

  const tableData = useMemo(() => {
    const locale = mapSupportedLanguageToLocale(currentLanguage);
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: timeFormat === "12-hour",
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    return {
      columns: ["#", "Title", "Bill To", "Due Date", "Created On"],
      rows: receiptsData.map((item) => [
        item.invoice_id,
        item.title,
        item.bill_to,
        new Date(item.due_date).toLocaleDateString(locale, dateOptions),
        new Date(item.receipt_date).toLocaleString(locale, dateTimeOptions),
      ]),
    };
  }, [receiptsData, timeFormat, currentLanguage]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalRecordCount = filteredRows.length;

  const handleRowClick = (item: Receipt) => {
    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;
    router.push({
      pathname: `/${userIdString}/receipts/${item.invoice_id}`,
      query: {
        data: JSON.stringify(item),
        view: "receipts",
      },
    });
  };

  const { handleDeleteRows } = useTableActions("receipts");

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Finance - Receipts</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-light">
              Receipts Ledger
            </h1>
            <p className="text-xs text-dark dark:text-light">
              {totalRecordCount} Record(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              label="Create Receipt"
              variant="primary"
              icon={{ left: "add" }}
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>
        <Table
          data={{ ...tableData, rows: paginatedRows }}
          filteredRows={filteredRows}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          totalRecordCount={totalRecordCount}
          onRowClick={(rowArray) => {
            const itemId = rowArray[0];
            const originalItem = receiptsData.find(
              (item) => item.invoice_id === itemId
            );
            if (originalItem) handleRowClick(originalItem);
          }}
          view="receipts"
          setCurrentPage={setCurrentPage}
          setItemsPerPage={() => {}}
          setSearchQuery={setSearchQuery}
          loading={loading}
          onDeleteRows={handleDeleteRows}
        />
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
            <div
              ref={panelRef}
              className="fixed top-0 right-0 h-full w-full md:w-[650px] bg-light dark:bg-gray-800 shadow-lg dark:border-l border-gray-700 overflow-y-auto"
              style={{
                transform: animate ? "translateX(0)" : "translateX(100%)",
                transition: "transform 300ms ease-out",
              }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-400 dark:border-gray-200">
                  <h2 className="text-xl font-semibold text-dark dark:text-light">
                    Create Receipt
                  </h2>
                  <button
                    className="text-gray-300 hover:text-gray-200 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    onClick={handleClosePanelAnimation}
                  >
                    <Icon type={"close"} className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6">
                  <ReceiptForm
                    userId={user_id}
                    onClose={() => {
                      handleClosePanelAnimation();
                      fetchData();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  );
};

export default FinanceReceipts;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import { Button, Table, TableData } from "@graminate/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import axiosInstance from "@/lib/utils/axiosInstance";
import InfoModal from "@/components/modals/InfoModal";
import { format } from "date-fns";

type Payment = {
  payment_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
};

const Billing = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const { plan, fetchUserSubTypes } = useUserPreferences();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
    showCancelButton?: boolean;
    onConfirm?: () => void;
    confirmButtonText?: string;
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchBillingData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [billingRes, userRes] = await Promise.all([
        axiosInstance.get(`/user/${userId}/billing-history`),
        axiosInstance.get(`/user/${userId}`),
      ]);

      const billingData = billingRes.data?.data?.payments ?? [];
      setPayments(billingData);

      const user = userRes.data?.data?.user ?? userRes.data?.user;
      if (user?.subscription_expires_at) {
        setSubscriptionExpiry(user.subscription_expires_at);
      }
      setPendingPlan(user?.pending_plan || null);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleCancelSubscription = async () => {
    if (!userId || plan === "FREE") return;

    setInfoModal({
      isOpen: true,
      title: "Cancel Subscription?",
      text: "Your plan will be downgraded to Free. Your current features will remain active until the end of your billing cycle.",
      variant: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel subscription",
      onConfirm: async () => {
        setIsCancelling(true);
        setInfoModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await axiosInstance.post(`/user/${userId}/schedule-downgrade`, {
            plan: "FREE",
          });

          setInfoModal({
            isOpen: true,
            title: "Subscription Cancelled",
            text: "Your plan will revert to Free at the end of your current billing cycle.",
            variant: "success",
          });

          if (userId) {
            fetchUserSubTypes(userId);
            fetchBillingData();
          }
        } catch (error: unknown) {
          console.error("Cancel subscription error:", error);
          let message = "Failed to cancel subscription. Please try again.";
          if (axios.isAxiosError(error)) {
            message = error.response?.data?.data?.error || message;
          }
          setInfoModal({
            isOpen: true,
            title: "Error",
            text: message,
            variant: "error",
          });
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "SUCCESS") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-300 text-green-100 dark:bg-green-200 dark:text-green-400">
          Success
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-300 text-red-100 dark:bg-red-200 dark:text-red-400">
        Failed
      </span>
    );
  };

  const tableData: TableData = {
    columns: ["#", "Payment ID", "Plan", "Amount", "Status", "Date"],
    rows: payments.map((payment, index) => [
      (index + 1).toString(),
      payment.razorpay_payment_id || "—",
      payment.plan_type,
      `${payment.currency} ${payment.amount}`,
      getStatusBadge(payment.status),
      payment.created_at
        ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")
        : "N/A",
    ]),
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tableData.rows;
    return tableData.rows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData.rows, searchQuery]);

  const planLabel =
    plan === "PRO" ? "Pro" : plan === "BASIC" ? "Standard" : "Free";

  const planBadgeClass =
    plan === "PRO"
      ? "bg-green-300 text-green-100 dark:bg-green-200 dark:text-green-400"
      : plan === "BASIC"
      ? "bg-blue-300 text-blue-100 dark:bg-blue-200 dark:text-blue-400"
      : "bg-gray-400 text-dark dark:bg-gray-200 dark:text-gray-300";

  const hasPendingCancellation = pendingPlan === "FREE" && plan !== "FREE";

  return (
    <>
      <Head>
        <title>Billing Settings</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />

          <main className="flex-1 px-6 md:px-12 py-6 space-y-6">
            <h1 className="pb-2 font-bold text-xl md:text-2xl text-dark dark:text-light">
              Billing
            </h1>

            {/* Subscription Overview */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light mb-4 opacity-80">
                Subscription Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                    Current Plan
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase ${planBadgeClass}`}
                  >
                    {planLabel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                    Next Transaction Date
                  </p>
                  <p className="text-sm font-medium text-dark dark:text-light">
                    {plan === "FREE"
                      ? "—"
                      : hasPendingCancellation
                      ? "Cancelled"
                      : subscriptionExpiry
                      ? format(new Date(subscriptionExpiry), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                    Cancel Subscription
                  </p>
                  {plan === "FREE" ? (
                    <p className="text-sm text-dark dark:text-light opacity-50">
                      No active subscription
                    </p>
                  ) : hasPendingCancellation ? (
                    <p className="text-sm text-orange-500 dark:text-orange-400 font-medium">
                      Cancels on{" "}
                      {subscriptionExpiry
                        ? format(new Date(subscriptionExpiry), "MMM dd, yyyy")
                        : "end of billing cycle"}
                    </p>
                  ) : (
                    <Button
                      label={isCancelling ? "Cancelling..." : "Cancel Subscription"}
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light mb-4 opacity-80">
                Billing History
              </h2>
              <Table
                data={tableData}
                filteredRows={filteredRows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                paginationItems={[
                  "10 per page",
                  "25 per page",
                  "50 per page",
                ]}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalRecordCount={filteredRows.length}
                loading={isLoading}
                hideChecks={true}
                download={false}
              />
            </div>
          </main>
        </div>
      </PlatformLayout>
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        text={infoModal.text}
        variant={infoModal.variant}
        showCancelButton={infoModal.showCancelButton}
        onConfirm={infoModal.onConfirm}
        confirmButtonText={infoModal.confirmButtonText}
      />
    </>
  );
};

export default Billing;

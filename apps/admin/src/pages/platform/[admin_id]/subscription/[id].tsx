import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Table, TableData, Button } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { format } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserDetails = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  plan: string;
  subscription_expires_at: string | null;
};

type Payment = {
  payment_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
  updated_at: string;
};

const SubscriptionBillingPage = () => {
  const router = useRouter();
  const { admin_id, id: userId } = router.query;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const fetchData = useCallback(async () => {
    if (!userId || !admin_id) return;

    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const [userRes, billingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/users/${userId}/billing-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (userRes.status === 401 || billingRes.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/");
        return;
      }

      if (!userRes.ok) throw new Error("Failed to fetch user details");
      if (!billingRes.ok) throw new Error("Failed to fetch billing history");

      const userData = await userRes.json();
      const billingData = await billingRes.json();

      if (userData.data?.user) {
        setUser(userData.data.user);
      }

      if (billingData.data?.payments) {
        setPayments(billingData.data.payments);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, admin_id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Only show Success and Failed transactions
      if (p.status === "PENDING") return false;

      const searchStr = searchQuery.toLowerCase();
      return (
        p.razorpay_order_id.toLowerCase().includes(searchStr) ||
        (p.razorpay_payment_id || "").toLowerCase().includes(searchStr) ||
        p.status.toLowerCase().includes(searchStr) ||
        p.plan_type.toLowerCase().includes(searchStr) ||
        p.currency.toLowerCase().includes(searchStr)
      );
    });
  }, [payments, searchQuery]);

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      SUCCESS: "bg-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      PENDING: "bg-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      FAILED: "bg-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
          colorMap[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const tableData: TableData = {
    columns: [
      "#",
      "Order ID",
      "Payment ID",
      "Plan",
      "Amount",
      "Status",
      "Date",
    ],
    rows: filteredPayments.map((payment, index) => [
      (index + 1).toString(),
      payment.razorpay_order_id,
      payment.razorpay_payment_id || "—",
      payment.plan_type,
      `${payment.currency} ${payment.amount}`,
      getStatusBadge(payment.status),
      payment.created_at
        ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")
        : "N/A",
    ]),
  };

  const formattedDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <>
      <Head>
        <title>
          {`Graminate | Billing History${
            user ? `: ${user.first_name} ${user.last_name}` : ""
          }`}
        </title>
      </Head>
      <PlatformLayout>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader />
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-800 rounded-xl bg-red-50 border border-red-100">
              <span className="font-medium">Error!</span> {error}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    icon={{ left: "chevron_left" }}
                    onClick={() =>
                      router.push(`/platform/${admin_id}/subscriptions`)
                    }
                  />
                  <div>
                    <h1 className="text-xl font-bold text-dark dark:text-light tracking-tight">
                      Billing History
                    </h1>
                  </div>
                </div>
              </div>

              {/* User Subscription Summary */}
              {user && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-400 dark:border-gray-100 p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light mb-4 opacity-80">
                    Subscription Overview
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                        Customer
                      </p>
                      <p className="text-sm font-bold text-dark dark:text-light">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-dark dark:text-light opacity-70">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                        Current Plan
                      </p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase ${
                          user.plan === "PRO"
                            ? "bg-green-300 text-green-100 dark:bg-green-200 dark:text-green-400"
                            : user.plan === "BASIC"
                            ? "bg-blue-300 text-blue-100 dark:bg-blue-200 dark:text-blue-400"
                            : "bg-gray-400 text-dark dark:bg-gray-200 dark:text-gray-300"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                        Subscription Expires
                      </p>
                      <p className="text-sm font-medium text-dark dark:text-light">
                        {user.plan === "FREE"
                          ? "Unlimited (Free Plan)"
                          : formattedDate(user.subscription_expires_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark dark:text-light opacity-60 mb-1">
                        Total Payments
                      </p>
                      <p className="text-sm font-medium text-dark dark:text-light">
                        {payments.length} transaction
                        {payments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Table */}
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-bold text-dark dark:text-light opacity-80 uppercase tracking-widest">
                  Payment Transactions
                </h2>

                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-400 dark:border-gray-200 overflow-hidden p-1">
                  <Table
                    data={tableData}
                    filteredRows={tableData.rows}
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
                    totalRecordCount={filteredPayments.length}
                    loading={false}
                    hideChecks={true}
                    download={true}
                    view="billing-history"
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default SubscriptionBillingPage;

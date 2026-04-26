import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Table, TableData } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import { format, addMonths, addDays } from "date-fns";
import Swal from "sweetalert2";
import ReasonModal from "@/components/modals/ReasonModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string | null;
  plan: string;
  subscription_expires_at: string | null;
  pending_plan: string | null;
  pending_plan_source: string | null;
};

const SubscriptionsPage = () => {
  const router = useRouter();
  const { admin_id } = router.query;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modal state
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ row: (string | React.ReactNode)[]; action: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!admin_id) return;

    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const usersResponse = await fetch(`${API_BASE_URL}/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/");
        return;
      }

      if (!usersResponse.ok) throw new Error("Failed to fetch users");
      
      const usersResult = await usersResponse.json();
      if (usersResult.data?.users) {
        setUsers(usersResult.data.users);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [admin_id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = (row: (string | React.ReactNode)[], action: string) => {
    setPendingAction({ row, action });
    setIsReasonModalOpen(true);
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!pendingAction) return;

    const { row, action } = pendingAction;
    const userId = row[0] as string;
    const token = localStorage.getItem("admin_token");
    
    let newPlan = "";
    let newExpiry: string | null = null;

    if (action === "Allow Basic Access") {
      newPlan = "BASIC";
      newExpiry = addMonths(new Date(), 1).toISOString();
    } else if (action === "Allow Pro Access") {
      newPlan = "PRO";
      newExpiry = addMonths(new Date(), 1).toISOString();
    } else if (action === "Revoke Paid Access") {
      newPlan = "FREE";
      newExpiry = null;
    }

    if (!newPlan) return;

    setIsActionLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pending_plan: newPlan,
          pending_plan_source: 'ADMIN',
          admin_reason: reason,
          admin_action: action,
          subscription_expires_at: newExpiry,
        }),
      });

      if (response.ok) {
        Swal.fire("Success", `User plan changed to ${newPlan}`, "success");
        setIsReasonModalOpen(false);
        setPendingAction(null);
        fetchData();
      } else {
        throw new Error("Failed to update plan");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error updating user plan:", error);
      Swal.fire("Error", "Failed to update user plan", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const pendingUserName = useMemo(() => {
    if (!pendingAction) return "";
    const userNameIndex = 1; // "User Name" column index in row data
    return String(pendingAction.row[userNameIndex] || "Unknown User");
  }, [pendingAction]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchStr = searchQuery.toLowerCase();
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const businessName = (user.business_name || "").toLowerCase();
      const plan = user.plan.toLowerCase();
      
      return (
        fullName.includes(searchStr) ||
        businessName.includes(searchStr) ||
        plan.includes(searchStr)
      );
    });
  }, [users, searchQuery]);

  const tableData: TableData = {
    columns: ["#", "User Name", "Business", "Plan", "Subscription Expiry", "Plan Change Status", "Action"],
    rows: filteredUsers.map((user) => [
      user.user_id,
      `${user.first_name} ${user.last_name}`,
      user.business_name || "N/A",
      user.plan,
      user.plan === "FREE" 
        ? "Unlimited" 
        : user.subscription_expires_at 
          ? format(new Date(user.subscription_expires_at), "MMM dd, yyyy") 
          : "N/A",
      user.pending_plan 
        ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium">
              {user.pending_plan} (From {user.subscription_expires_at ? format(addDays(new Date(user.subscription_expires_at), 1), "MMM dd, yyyy") : "Next Month"})
            </span>
            {user.pending_plan_source === 'ADMIN' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-300 text-blue-100 w-fit">
                Manual
              </span>
            )}
          </div>
        )
        : "None",
      "ACTION_SLOT", // Placeholder for the Action column handled by Table component
    ]),
  };

  return (
    <>
      <Head>
        <title>Graminate | Subscriptions</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 sm:p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
              Subscriptions
            </h1>
            <p className="text-sm text-dark dark:text-light mt-1 opacity-70">
              Manage platform subscriptions and user plans.
            </p>
          </header>

          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark dark:text-light opacity-80 uppercase tracking-widest text-[11px]">
                Manage Subscription
              </h2>
            </div>

            {error ? (
              <div className="p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100">
                <span className="font-medium">Error!</span> {error}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-800 overflow-hidden p-1">
                <Table
                  data={tableData}
                  filteredRows={tableData.rows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  paginationItems={["10 per page", "25 per page", "50 per page", "100 per page"]}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  totalRecordCount={filteredUsers.length}
                  loading={isLoading}
                  view="subscriptions"
                  hideChecks={true}
                  download={false}
                  onAction={handleAction}
                  onRowClick={(row) => {
                    const userId = row[0] as string;
                    router.push(`/platform/${admin_id}/subscription/${userId}`);
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </PlatformLayout>

      <ReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => {
          setIsReasonModalOpen(false);
          setPendingAction(null);
        }}
        onSubmit={handleReasonSubmit}
        action={pendingAction?.action || ""}
        userName={pendingUserName}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default SubscriptionsPage;

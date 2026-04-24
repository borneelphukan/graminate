import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Table, TableData } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import { format, addMonths } from "date-fns";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string | null;
  plan: string;
  subscription_expires_at: string | null;
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
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [admin_id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (row: any[], action: string) => {
    const userId = row[0]; // The hidden # column containing user_id
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

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: newPlan,
          subscription_expires_at: newExpiry,
        }),
      });

      if (response.ok) {
        Swal.fire("Success", `User plan changed to ${newPlan}`, "success");
        fetchData();
      } else {
        throw new Error("Failed to update plan");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

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
    columns: ["#", "User Name", "Business", "Plan", "Subscription Expiry Date", "Action"],
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
                />
              </div>
            )}
          </section>
        </div>
      </PlatformLayout>
    </>
  );
};

export default SubscriptionsPage;

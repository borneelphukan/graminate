import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Table, TableData } from "@graminate/ui";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartEvent,
  ActiveElement,
} from "chart.js";
import PlatformLayout from "@/layout/PlatformLayout";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string | null;
  type: string;
  sub_type: string;
  plan: string;
  phone_number: string | null;
  subscription_expires_at: string | null;
};

type AdminUser = {
  first_name: string;
  last_name: string;
};

const AdminUsersPage = () => {
  const router = useRouter();
  const { admin_id } = router.query;
  const [users, setUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    const fetchData = async () => {
      if (!admin_id) return;

      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const [adminResponse, countResponse, usersResponse] = await Promise.all(
          [
            fetch(`${API_BASE_URL}/admin/me`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/admin/user-count`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/admin/all-users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]
        );

        if (
          adminResponse.status === 401 ||
          countResponse.status === 401 ||
          usersResponse.status === 401
        ) {
          localStorage.removeItem("admin_token");
          router.push("/");
          return;
        }

        const adminResult = await adminResponse.json();
        if (adminResponse.ok && adminResult.data?.first_name) {
          setAdminUser(adminResult.data);
        }

        if (!countResponse.ok) throw new Error("Failed to fetch user count");
        const countResult = await countResponse.json();
        if (countResult.data?.count !== undefined) {
          setUserCount(parseInt(countResult.data.count, 10));
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
    };

    fetchData();
  }, [router, admin_id]);

  const typeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    users.forEach((user) => {
      dist[user.type] = (dist[user.type] || 0) + 1;
    });
    return dist;
  }, [users]);

  const subTypeDistribution = useMemo(() => {
    if (!selectedType) return {};
    const dist: Record<string, number> = {};
    users
      .filter((u) => u.type === selectedType)
      .forEach((user) => {
        const subTypes = Array.isArray(user.sub_type)
          ? user.sub_type
          : typeof user.sub_type === "string"
          ? user.sub_type.replace(/[{}"]/g, "").split(",")
          : [];
        subTypes.forEach((st: string) => {
          if (st) dist[st] = (dist[st] || 0) + 1;
        });
      });
    return dist;
  }, [users, selectedType]);

  const chartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 10, weight: "bold" as const },
          color: "#4a5568",
        },
      },
      title: {
        display: true,
        text: title,
        align: "start" as const,
        color: "#2d3748",
        font: { size: 16 },
      },
    },
  });

  const typeChartData = {
    labels: Object.keys(typeDistribution),
    datasets: [
      {
        data: Object.values(typeDistribution),
        backgroundColor: [
          "#2b7860",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#10b981",
        ],
        borderWidth: 0,
      },
    ],
  };

  const subTypeChartData = {
    labels: Object.keys(subTypeDistribution),
    datasets: [
      {
        data: Object.values(subTypeDistribution),
        backgroundColor: [
          "#2b7860",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#10b981",
        ],
        borderWidth: 0,
      },
    ],
  };

  const handleChartClick = (
    event: ChartEvent,
    elements: ActiveElement[]
  ) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const type = typeChartData.labels[index];
      setSelectedType(type);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(prev => prev.filter(u => u.user_id !== userId));
      if (userCount !== null) setUserCount(userCount - 1);
      
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleAction = (row: any[], action: string) => {
    if (action === "DELETE") {
      handleDeleteUser(row[0], row[2]); // # is index 0, Contact Email is index 2
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  const tableData: TableData = useMemo(() => ({
    columns: ["#", "User Name", "Contact Email", "Phone", "Business", "Plan", "Actions"],
    rows: filteredUsers.map((user) => [
      user.user_id,
      `${user.first_name} ${user.last_name}`,
      user.email,
      user.phone_number || "N/A",
      user.business_name || "N/A",
      user.plan,
      "ACTION_SLOT",
    ]),
  }), [filteredUsers]);

  return (
    <>
      <Head>
        <title>Graminate | Admin Users</title>
      </Head>
      <PlatformLayout>
        <div className="min-h-screen container mx-auto p-4 flex flex-col items-stretch gap-12">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-end border-b border-gray-400 dark:border-gray-600 pb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-dark dark:text-light mt-1">
                {isLoading 
                  ? "Retrieving platform statistics..." 
                  : `Overseeing ${userCount ?? 0} registered users across the platform`}
              </p>
            </div>
            {adminUser && (
              <div className="text-right hidden sm:block">
                <p className="text-xs uppercase font-bold text-dark dark:text-light">Administrator</p>
                <p className="text-sm font-semibold text-dark dark:text-light">
                  {adminUser.first_name} {adminUser.last_name}
                </p>
              </div>
            )}
          </header>

          {error && (
            <div
              className="p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100"
              role="alert"
            >
              <span className="font-medium">Configuration Error!</span> {error}
            </div>
          )}

          {!error && (
            <>
              {/* Analytics Section */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-dark dark:text-light opacity-80 uppercase tracking-widest text-[11px]">
                    User Statistics
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-400 dark:border-gray-800 shadow-sm h-[420px] flex flex-col">
                    {!isLoading ? (
                      <Pie
                        data={typeChartData}
                        options={{
                          ...chartOptions("User Distribution by Type"),
                          onClick: handleChartClick,
                        }}
                      />
                    ) : (
                      <div className="flex-1 flex items-center justify-center animate-pulse">
                        <div className="size-48 rounded-full bg-gray-400 dark:bg-gray-700"></div>
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-400 dark:border-gray-800 shadow-sm h-[420px] flex items-center justify-center">
                    {!isLoading ? (
                      selectedType ? (
                        <div className="w-full h-full">
                          <Pie
                            data={subTypeChartData}
                            options={chartOptions(`Sub-Type Distribution: ${selectedType}`)}
                          />
                        </div>
                      ) : (
                        <div className="text-center group">
                          <div className="size-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl opacity-40">📊</span>
                          </div>
                          <p className="font-bold text-dark dark:text-light">Select a category</p>
                          <p className="text-sm text-dark dark:text-light mt-1">
                            Click on a slice in the primary chart to deep-dive into sub-type data.
                          </p>
                        </div>
                      )
                    ) : (
                       <div className="flex-1 flex items-center justify-center animate-pulse">
                        <div className="size-48 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* User Records Section */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-dark dark:text-light opacity-80 uppercase tracking-widest text-[11px]">
                    Registered User Records
                  </h2>
                </div>

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
                    view="users"
                    onAction={handleAction}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default AdminUsersPage;

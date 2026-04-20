import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Icon, SearchBar } from "@graminate/ui";
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
        if (Array.isArray(usersResult.data?.users)) {
          setUsers(usersResult.data.users);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, admin_id]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  const typeChartData = useMemo(() => {
    if (!users.length) return { labels: [], datasets: [] };
    const typeCounts = users.reduce((acc, user) => {
      acc[user.type] = (acc[user.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: "# of Users",
          data: Object.values(typeCounts),
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 206, 86, 0.6)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [users]);

  const subTypeChartData = useMemo(() => {
    if (!selectedType || !users.length) return { labels: [], datasets: [] };
    const subTypeCounts = users
      .filter((user) => user.type === selectedType && user.sub_type)
      .reduce((acc, user) => {
        const subTypes = String(user.sub_type).split(",");
        subTypes.forEach((subType) => {
          const trimmed = subType.trim();
          if (trimmed) {
            acc[trimmed] = (acc[trimmed] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

    return {
      labels: Object.keys(subTypeCounts),
      datasets: [
        {
          label: "# of Users",
          data: Object.values(subTypeCounts),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [users, selectedType]);

  const handleChartClick = (
    event: ChartEvent,
    elements: ActiveElement[],
    chart: ChartJS
  ) => {
    if (elements.length > 0) {
      const elementIndex = elements[0].index;
      const clickedLabel = chart.data.labels?.[elementIndex] as string;
      setSelectedType(selectedType === clickedLabel ? null : clickedLabel);
    }
  };

  const chartOptions = (titleText: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#4a5568" } },
      title: {
        display: true,
        text: titleText,
        color: "#2d3748",
        font: { size: 16 },
      },
    },
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleDeleteUser = async (e: React.MouseEvent, userId: string, email: string) => {
    e.stopPropagation();
    
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

      // Refresh data
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      if (userCount !== null) setUserCount(userCount - 1);
      
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const tableData = useMemo(
    () => ({
      columns: [
        "User Name",
        "Contact Email",
        "Phone",
        "Business",
        "Plan",
        "Actions",
      ],
      rows: paginatedUsers.map((user) => [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.phone_number || "N/A",
        user.business_name || "N/A",
        user.plan,
        "actions", // placeholder for cell logic
      ]),
    }),
    [paginatedUsers]
  );

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
                User Management Dashboard
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
                        options={{
                          ...chartOptions("User Distribution by Type"),
                          onClick: handleChartClick,
                        }}
                        data={typeChartData}
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
                            options={chartOptions(
                              `Sub-Type Distribution: ${selectedType}`
                            )}
                            data={subTypeChartData}
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
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 dark:bg-gray-800/50 border border-gray-400 dark:border-gray-700 rounded-xl text-sm transition-all font-bold text-dark dark:text-light placeholder:text-gray-300"
                    />
                    <Icon type="search" className="absolute left-3 top-2.5 size-4 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-400 dark:border-gray-700">
                          {tableData.columns.map((header: string, idx: number) => (
                            <th
                              key={idx}
                              className="px-6 py-4 text-left text-xs font-bold text-dark dark:text-light uppercase tracking-widest"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 divide-gray-400 dark:divide-gray-700">
                        {isLoading ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              {[...Array(tableData.columns.length)].map((_, j) => (
                                <td key={j} className="px-6 py-4">
                                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : paginatedUsers.length > 0 ? (
                          paginatedUsers.map((user: User, idx: number) => (
                            <tr
                              key={user.user_id}
                              onClick={() => router.push(`/platform/${admin_id}/users/${user.user_id}`)}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-dark dark:text-light group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {user.first_name} {user.last_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-light">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-light">
                                {user.phone_number || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-light">
                                {user.business_name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                  user.plan === "PAID" ? "bg-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-400 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}>
                                  {user.plan}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  label="Delete"
                                  variant="destructive"
                                  onClick={(e) => handleDeleteUser(e, user.user_id, user.email)}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={tableData.columns.length} className="px-6 py-12 text-center text-gray-500">
                              No users found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-6 py-4 border-t border-gray-400 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                    <div className="text-xs font-bold text-dark dark:text-light opacity-60">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                         onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                         disabled={currentPage === 1}
                         className="p-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                       >
                         <Icon type="chevron_left" className="size-5" />
                       </button>
                       <span className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-dark dark:text-light">
                         Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage) || 1}
                       </span>
                       <button
                         onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
                         disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                         className="p-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                       >
                         <Icon type="chevron_right" className="size-5" />
                       </button>
                    </div>
                  </div>
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

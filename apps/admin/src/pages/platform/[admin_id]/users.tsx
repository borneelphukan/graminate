import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Table, SearchBar } from "@graminate/ui";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartEvent,
  ActiveElement,
} from "chart.js";
import PlatformLayout from "@/layouts/PlatformLayout";

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

  const tableData = useMemo(
    () => ({
      columns: [
        "Owner Name",
        "Contact Email",
        "Business Name",
        "Type",
        "Services Opted",
        "Plan",
        "Plan Expiry",
      ],
      rows: filteredUsers.map((user) => [
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.business_name || "N/A",
        user.type,
        String(user.sub_type || "").split(",").filter(Boolean).length,
        user.plan,
        user.plan === "FREE"
          ? "Unlimited"
          : user.subscription_expires_at
          ? new Date(user.subscription_expires_at).toLocaleDateString()
          : "N/A",
      ]),
    }),
    [filteredUsers]
  );

  return (
    <>
      <Head>
        <title>Graminate | Admin Users</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          <header className="flex justify-between items-center mb-8 pb-3 border-b border-gray-300">
            <div>
              <h1 className="text-lg font-semibold text-dark dark:text-light">
                User Management
              </h1>
              {adminUser && (
                <p className="text-sm text-gray-600">
                  Welcome, {adminUser.first_name} {adminUser.last_name}
                </p>
              )}
            </div>
          </header>

          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
              role="alert"
            >
              <span className="font-medium">Error!</span> {error}
            </div>
          )}

          {!error && (
            <>
              <section className="mb-8 p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-700">
                  Total Registered Users:{" "}
                  <span className="text-blue-600 font-bold">
                    {isLoading ? "..." : userCount ?? "N/A"}
                  </span>
                </h2>
              </section>

              <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow h-[400px] flex flex-col">
                  {!isLoading && (
                    <Pie
                      options={{
                        ...chartOptions("User Distribution by Type"),
                        onClick: handleChartClick,
                      }}
                      data={typeChartData}
                    />
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow h-[400px] flex items-center justify-center">
                  {!isLoading &&
                    (selectedType ? (
                      <div className="w-full h-full">
                        <Pie
                          options={chartOptions(
                            `Sub-Type Distribution for ${selectedType}`
                          )}
                          data={subTypeChartData}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-dark">
                        <p className="font-semibold">View Sub-Type Details</p>
                        <p className="text-sm">
                          Click on a slice in the user type chart to see
                          details.
                        </p>
                      </div>
                    ))}
                </div>
              </section>
              {admin_id && (
                <div className="mt-8">
                  <Table
                    data={tableData}
                    filteredRows={tableData.rows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    paginationItems={["25 per page", "50 per page", "100 per page"]}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    totalRecordCount={filteredUsers.length}
                    onRowClick={(row) => {
                      const userEmail = row[1] as string;
                      const user = users.find((u) => u.email === userEmail);
                      if (user) {
                        router.push(`/platform/${admin_id}/users/${user.user_id}`);
                      }
                    }}
                    view="admin_users"
                    loading={isLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default AdminUsersPage;

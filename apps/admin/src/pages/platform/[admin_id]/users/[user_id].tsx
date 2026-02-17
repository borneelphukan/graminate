import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layouts/PlatformLayout";
import Loader from "@/components/ui/Loader";
import Button from "@/components/ui/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserDetails = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string | null;
  type: string;
  sub_type: string[];
  plan: string;
  subscription_expires_at: string | null;
  created_at: string;
};

type LoginHistoryEntry = {
  logged_in_at: string;
  logged_out_at: string | null;
  session_duration: string | null;
};

const AdminUserDetailsPage = () => {
  const router = useRouter();
  const { admin_id, user_id } = router.query;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user_id) return;

      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const [userResponse, historyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/users/${user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/admin/users/${user_id}/login-history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userResponse.status === 401 || historyResponse.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/");
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details.");
        }
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch login history.");
        }

        const userResult = await userResponse.json();
        const historyResult = await historyResponse.json();

        if (userResult.data?.user) {
          setUser(userResult.data.user);
        } else {
          throw new Error("User not found.");
        }

        if (historyResult.data?.history) {
          setLoginHistory(historyResult.data.history);
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

    fetchAllData();
  }, [router, user_id]);

  const services = user?.sub_type || [];

  const formattedDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formattedDateTime = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <>
      <Head>
        <title>
          {`Graminate | User Details: ${
            user ? `${user.first_name} ${user.last_name}` : "Loading..."
          }`}
        </title>
      </Head>
      <PlatformLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : error ? (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
              role="alert"
            >
              <span className="font-medium">Error!</span> {error}
            </div>
          ) : user ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="p-4 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      User Information
                    </h1>
                    <h2 className="text-sm font-thin text-dark dark:text-light mt-1">
                      <span className="font-semibold">Admin ID:</span>{" "}
                      {admin_id}
                    </h2>
                  </div>
                  <Button
                    text="Back to All Users"
                    style="secondary"
                    arrow="left"
                    onClick={() => router.push(`/platform/${admin_id}/users`)}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 p-4 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="font-semibold block">Full Name</span>
                      {`${user.first_name} ${user.last_name}`}
                    </div>
                    <div>
                      <span className="font-semibold block">Contact Email</span>
                      {user.email}
                    </div>
                    <div>
                      <span className="font-semibold block">Business Name</span>
                      {user.business_name || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold block">Account Type</span>
                      {user.type}
                    </div>
                    <div>
                      <span className="font-semibold block">
                        Subscription Plan
                      </span>
                      {user.plan}
                    </div>
                    <div>
                      <span className="font-semibold block">Plan Expiry</span>
                      {user.plan === "FREE"
                        ? "Unlimited"
                        : formattedDate(user.subscription_expires_at)}
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <span className="font-semibold block">
                        Services Opted ({services.length})
                      </span>
                      {services.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5 mt-1">
                          {services.map((service, index) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      ) : (
                        "No services opted."
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:px-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Recent Session History
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Logged In At
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Logged Out At
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Session Duration (HH:MM:SS)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.length > 0 ? (
                        loginHistory.map((entry, index) => (
                          <tr
                            key={index}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="px-6 py-4">
                              {formattedDateTime(entry.logged_in_at)}
                            </td>
                            <td className="px-6 py-4">
                              {entry.logged_out_at
                                ? formattedDateTime(entry.logged_out_at)
                                : "-"}
                            </td>
                            <td className="px-6 py-4">
                              {entry.session_duration ?? "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center">
                            No session history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No user data found.</p>
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default AdminUserDetailsPage;

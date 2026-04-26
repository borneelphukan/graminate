import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import Loader from "@/components/ui/Loader";
import { Button } from "@graminate/ui";

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

const AdminUserDetailsPage = () => {
  const router = useRouter();
  const { admin_id, user_id } = router.query;
  const [user, setUser] = useState<UserDetails | null>(null);
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
        const userResponse = await fetch(`${API_BASE_URL}/admin/users/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/");
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details.");
        }

        const userResult = await userResponse.json();

        if (userResult.data?.user) {
          setUser(userResult.data.user);
        } else {
          throw new Error("User not found.");
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
    } catch {
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
        <div className="mx-auto min-h-screen bg-neutral-light/30">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader />
            </div>
          ) : error ? (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100"
              role="alert"
            >
              <span className="font-medium">Error!</span> {error}
            </div>
          ) : user ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    icon={{ left: "chevron_left" }}
                    onClick={() => router.push(`/platform/${admin_id}/users`)}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-dark dark:text-light tracking-tight">
                      User Profile
                    </h1>
                    <p className="text-sm text-dark dark:text-light mt-1">
                      Viewing details for User ID: <span className="font-mono text-xs">{user.user_id}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Info Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-800 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-400 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-dark dark:text-light">
                        {user.first_name} {user.last_name}
                      </h2>
                      <p className="text-dark dark:text-light">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {/* Basic Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light">Account Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-dark dark:text-light">Business Name</span>
                          <span className="font-medium text-dark dark:text-light">{user.business_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-dark dark:text-light">Account Type</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                            {user.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-dark dark:text-light">Joined On</span>
                          <span className="font-medium text-dark dark:text-light">{formattedDate(user.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-light">Subscription</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-dark dark:text-light">Current Plan</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            user.plan === "PRO" 
                              ? "bg-green-200 text-green-600"
                              : "bg-gray-400 text-gray-600"
                          }`}>
                            {user.plan}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-dark dark:text-light">Expires At</span>
                          <span className="font-medium text-dark dark:text-light">
                            {user.plan === "FREE" ? "Unlimited" : formattedDate(user.subscription_expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Services Section */}
                    <div className="md:col-span-2 pt-6 border-t border-gray-400 dark:border-gray-600">
                      <h3 className="text-sm font-bold text-dark dark:text-light mb-4">
                        Services Opted ({services.length})
                      </h3>
                      {services.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {services.map((service, index) => (
                            <span 
                              key={index}
                              className="px-4 py-2 rounded-xl border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-dark dark:text-light"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No services opted by this user.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-bold text-dark">User Not Found</h3>
              <p className="text-gray-500 mt-1">We couldn&apos;t locate details for this user ID.</p>
              <Button
                label="Back to Dashboard"
                variant="primary"
                className="mt-6"
                onClick={() => router.push(`/platform/${admin_id}/users`)}
              />
            </div>
          )}
        </div>
      </PlatformLayout>
    </>
  );
};

export default AdminUserDetailsPage;

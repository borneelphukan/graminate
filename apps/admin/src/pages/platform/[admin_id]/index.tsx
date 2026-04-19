import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import TotalUsersWidget from "@/components/dashboard/TotalUsersWidget";
import UserDistributionWidget from "@/components/dashboard/UserDistributionWidget";
import WidgetModal from "@/components/modals/WidgetModal";
import { Icon } from "@graminate/ui";

const AdminDashboardPage = () => {
  const router = useRouter();
  const { admin_id } = router.query;
  const { timeFormat, widgets, updateUserWidgets } = useUserPreferences();

  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [stats, setStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    paidUsers: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!admin_id) return;

    const fetchAdminData = async () => {
      setIsAdminLoading(true);
      try {
        const response = await axiosInstance.get("/admin/me");
        setAdminUser(response.data?.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsAdminLoading(false);
      }
    };

    const fetchPlatformStats = async () => {
      setIsStatsLoading(true);
      try {
        const [countRes, usersRes] = await Promise.all([
          axiosInstance.get("/admin/user-count"),
          axiosInstance.get("/admin/all-users"),
        ]);

        const total = countRes.data?.data?.count || 0;
        const allUsers = usersRes.data?.data?.users || [];
        
        const paid = allUsers.filter((u: any) => u.plan === "PAID").length;
        const free = total - paid;

        setStats({
          totalUsers: parseInt(total as string, 10),
          freeUsers: free,
          paidUsers: paid,
        });
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchAdminData();
    fetchPlatformStats();
  }, [admin_id]);

  const handleSaveWidgets = async (newWidgets: string[]) => {
    if (!admin_id) return;
    await updateUserWidgets(admin_id as string, newWidgets);
    setIsWidgetModalOpen(false);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: timeFormat === "12-hour",
    });

  return (
    <>
      <Head>
        <title>Graminate | Admin Dashboard</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 sm:p-6">
          <header className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h1 className="text-xl font-bold text-dark dark:text-light tracking-tight">
                  {isAdminLoading ? "Loading..." : `Hello ${adminUser?.first_name || "Admin"},`}
                </h1>
                <p className="text-sm text-dark dark:text-light mt-1">
                  Welcome back to the Command Centre.
                </p>
              </div>
              
              <div className="flex flex-col items-start sm:items-end gap-1 mt-3 sm:mt-0 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-dark dark:text-light sm:text-right">
                  <p className="font-semibold">{formatDate(currentDateTime)}</p>
                  <p className="font-mono">{formatTime(currentDateTime)}</p>
                </div>
              </div>
            </div>
          </header>

          <hr className="mb-6 border-gray-400 dark:border-gray-700 opacity-30" />

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setIsWidgetModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/50"
            >
              <Icon type="dashboard_customize" className="size-4" />
              Manage Dashboard Widgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.includes("Total Users") && (
              <TotalUsersWidget count={stats.totalUsers} isLoading={isStatsLoading} />
            )}
            {widgets.includes("Plan Distribution") && (
              <UserDistributionWidget 
                data={{ free: stats.freeUsers, paid: stats.paidUsers }} 
                isLoading={isStatsLoading} 
              />
            )}
          </div>
        </div>

        <WidgetModal
          isOpen={isWidgetModalOpen}
          onClose={() => setIsWidgetModalOpen(false)}
          onSave={handleSaveWidgets}
          initialSelectedWidgets={widgets}
        />
      </PlatformLayout>
    </>
  );
};

export default AdminDashboardPage;


import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import TotalUsersWidget from "@/components/dashboard/TotalUsersWidget";
import UserDistributionWidget from "@/components/dashboard/UserDistributionWidget";
import SignupGraphWidget from "@/components/dashboard/SignupGraphWidget";
import WidgetModal from "@/components/modals/WidgetModal";
import { Icon } from "@graminate/ui";
import { 
  format, 
  subDays, 
  startOfDay, 
  isSameDay, 
  eachDayOfInterval, 
  startOfMonth, 
  eachMonthOfInterval, 
  isSameMonth, 
  startOfWeek, 
  eachWeekOfInterval, 
  isSameWeek,
  subMonths,
  subYears,
  endOfDay,
  endOfWeek,
  endOfMonth,
  eachHourOfInterval,
  isSameHour,
} from "date-fns";

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
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [growthData, setGrowthData] = useState({
    labels: [] as string[],
    signupCounts: [] as number[],
    conversionRates: [] as number[],
  });
  const [isGrowthLoading, setIsGrowthLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");

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
      setIsGrowthLoading(true);
      try {
        const [countRes, usersRes] = await Promise.all([
          axiosInstance.get("/admin/user-count"),
          axiosInstance.get("/admin/all-users"),
        ]);

        const total = countRes.data?.data?.count || 0;
        const fetchedUsers = usersRes.data?.data?.users || [];
        setAllUsers(fetchedUsers);
        
        const pro = fetchedUsers.filter((u: any) => u.plan === "PRO" || u.plan === "BASIC").length;
        const totalFetched = fetchedUsers.length;
        const free = totalFetched - pro;

        setStats({
          totalUsers: totalFetched,
          freeUsers: free,
          paidUsers: pro,
        });

        // Initial growth data processing (Weekly)
        processGrowthData(fetchedUsers, "Weekly");

      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setIsStatsLoading(false);
        setIsGrowthLoading(false);
      }
    };

    fetchAdminData();
    fetchPlatformStats();
  }, [admin_id]);

  const processGrowthData = (users: any[], period: string) => {
    const now = new Date();
    let labels: string[] = [];
    let signupCounts: number[] = [];
    let conversionRates: number[] = [];

    if (period === "Daily") {
      const hours = eachHourOfInterval({
        start: startOfDay(now),
        end: now,
      });

      labels = hours.map((h) => format(h, "HH:mm"));
      signupCounts = hours.map(
        (h) => users.filter((u) => isSameHour(new Date(u.created_at), h)).length
      );

      conversionRates = hours.map((h) => {
        const usersInHour = users.filter((u) =>
          isSameHour(new Date(u.created_at), h)
        );
        if (usersInHour.length === 0) return 0;
        const paidInHour = usersInHour.filter(
          (u) => u.plan === "PRO" || u.plan === "BASIC"
        ).length;
        return (paidInHour / usersInHour.length) * 100;
      });
    } else if (period === "Weekly") {
      const days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now,
      });

      labels = days.map(d => format(d, "EEE"));
      signupCounts = days.map(d => 
        users.filter(u => isSameDay(new Date(u.created_at), d)).length
      );
      
      // Calculate cumulative conversion rate for each day
      conversionRates = days.map((d) => {
        const usersOnDay = users.filter((u) => isSameDay(new Date(u.created_at), d));
        if (usersOnDay.length === 0) return 0;
        const paidOnDay = usersOnDay.filter(
          (u) => u.plan === "PRO" || u.plan === "BASIC"
        ).length;
        return (paidOnDay / usersOnDay.length) * 100;
      });

    } else if (period === "Monthly") {
      const weeks = eachWeekOfInterval({
        start: startOfMonth(now),
        end: now,
      }, { weekStartsOn: 1 });

      labels = weeks.map((w, i) => `Week ${i + 1}`);
      signupCounts = weeks.map(w =>
        users.filter(u => isSameWeek(new Date(u.created_at), w, { weekStartsOn: 1 })).length
      );

      conversionRates = weeks.map((w) => {
        const usersInWeek = users.filter((u) =>
          isSameWeek(new Date(u.created_at), w, { weekStartsOn: 1 })
        );
        if (usersInWeek.length === 0) return 0;
        const paidInWeek = usersInWeek.filter(
          (u) => u.plan === "PRO" || u.plan === "BASIC"
        ).length;
        return (paidInWeek / usersInWeek.length) * 100;
      });

    } else if (period === "Yearly") {
      const months = eachMonthOfInterval({
        start: subMonths(now, 11),
        end: now,
      });

      labels = months.map(m => format(m, "MMM"));
      signupCounts = months.map(m =>
        users.filter(u => isSameMonth(new Date(u.created_at), m)).length
      );

      conversionRates = months.map((m) => {
        const usersInMonth = users.filter((u) =>
          isSameMonth(new Date(u.created_at), m)
        );
        if (usersInMonth.length === 0) return 0;
        const paidInMonth = usersInMonth.filter(
          (u) => u.plan === "PRO" || u.plan === "BASIC"
        ).length;
        return (paidInMonth / usersInMonth.length) * 100;
      });
    }

    setGrowthData({ labels, signupCounts, conversionRates });
  };

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
                  Welcome to your admin dashboard.
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

          <hr className="mb-3 border-gray-400 dark:border-gray-700" />

          <div
            className="flex items-center cursor-pointer text-sm mb-3 text-blue-200 hover:text-blue-100 dark:hover:text-blue-300"
            onClick={() => setIsWidgetModalOpen(true)}
          >
            Manage Widgets
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
            {widgets.includes("User Growth Trend") && (
              <SignupGraphWidget 
                data={growthData} 
                isLoading={isGrowthLoading} 
                onPeriodChange={(period) => {
                  setSelectedPeriod(period);
                  processGrowthData(allUsers, period);
                }}
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


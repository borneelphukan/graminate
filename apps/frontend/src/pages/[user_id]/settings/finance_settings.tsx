import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SettingsBar from "@/components/layout/SettingsBar";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { Button } from "@graminate/ui";
import TextField from "@/components/ui/TextField";
import axiosInstance from "@/lib/utils/axiosInstance";
import InfoModal from "@/components/modals/InfoModal";
import Loader from "@/components/ui/Loader";

const FinanceSettings = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [openingBalance, setOpeningBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [infoModalState, setInfoModalState] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant?: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: undefined,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchFinanceData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const userData = response.data.user ?? response.data.data?.user;
        if (userData) {
          setOpeningBalance(String(userData.opening_balance || 0));
        }
      } catch (error) {
        console.error("Error fetching finance settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinanceData();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await axiosInstance.put(`/user/${userId}`, {
        opening_balance: Number(openingBalance),
      });
      setInfoModalState({
        isOpen: true,
        title: "Success",
        text: "Finance settings updated successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating finance settings:", error);
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: error.response?.data?.message || "Failed to update settings.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings | Finance</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-4 sm:px-6 md:px-12">
            <div className="py-6">
              <div className="font-bold text-lg text-dark dark:text-light">
                Finance Settings
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <p className="mt-2 text-sm text-dark dark:text-gray-400">
                  Manage your financial baselines and reporting preferences
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader />
                </div>
              ) : (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm max-w-2xl">
                        <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">
                            Opening Balance
                        </h3>
                        <p className="text-sm text-dark dark:text-light mb-6">
                            Set the starting cash balance for your business. This value is used as the baseline for your Working Capital Analysis charts.
                        </p>
                        
                        <div className="max-w-xs">
                            <TextField
                                label="Initial Capital (INR)"
                                number
                                value={openingBalance}
                                onChange={(v) => setOpeningBalance(v)}
                                placeholder="0.00"
                                width="large"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button 
                            label={isSaving ? "Saving..." : "Save Changes"} 
                            variant="primary" 
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                        />
                    </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </PlatformLayout>
      <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() => setInfoModalState((prev) => ({ ...prev, isOpen: false }))}
        title={infoModalState.title}
        text={infoModalState.text}
        variant={infoModalState.variant}
      />
    </>
  );
};

export default FinanceSettings;

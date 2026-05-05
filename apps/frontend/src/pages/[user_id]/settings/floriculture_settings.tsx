import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import { Dropdown, Button, Switch } from "@graminate/ui";
import Loader from "@/components/ui/Loader";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator, translations } from "@/translations";

type TranslationKey = keyof typeof translations.English;

const FloricultureSettings = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const { language: currentLanguage } = useUserPreferences();
  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [wateringAlertsEnabled, setWateringAlertsEnabled] = useState(false);
  const [alertTime, setAlertTime] = useState("On Same Day");

  useEffect(() => {
    const savedEnabled = localStorage.getItem("floriculture_watering_alerts_enabled") === "true";
    const savedTime = localStorage.getItem("floriculture_watering_alert_time") || "On Same Day";
    setWateringAlertsEnabled(savedEnabled);
    setAlertTime(savedTime);
  }, []);

  const handleSaveFloricultureSettings = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      // For now we persist in localStorage as requested before, 
      // but we could also send to backend if we had specific fields.
      localStorage.setItem("floriculture_watering_alerts_enabled", String(wateringAlertsEnabled));
      localStorage.setItem("floriculture_watering_alert_time", alertTime);

      setSuccessMessage(t("floricultureUpdateSuccess" as TranslationKey));
    } catch (error: unknown) {
      let msg = t("anUnknownErrorOccurred" as TranslationKey);
      if (error instanceof Error) msg = error.message;
      setErrorMessage(`${t("floricultureUpdateError" as TranslationKey)} ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const alertOptions = [
    t("onSameDay" as TranslationKey),
    t("oneDayBefore" as TranslationKey),
    t("twoDaysBefore" as TranslationKey),
  ];

  return (
    <>
      <Head>
        <title>{t("floricultureSettings" as TranslationKey)}</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-4 sm:px-6 md:px-12">
            <div className="py-6">
              <div className="pb-4 font-bold text-lg text-dark dark:text-light">
                {t("floricultureSettings" as TranslationKey)}
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : (
                <section>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <p className="mt-2 text-sm text-dark dark:text-light">
                      {t("floricultureSettingsDescription" as TranslationKey)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 max-w-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-dark dark:text-light">
                          {t("wateringAlerts" as TranslationKey)}
                        </span>
                        <span className="text-xs text-dark dark:text-light">
                          {t("setWateringAlerts" as TranslationKey)}
                        </span>
                      </div>
                      <Switch
                        id="watering-alerts"
                        checked={wateringAlertsEnabled}
                        onChange={setWateringAlertsEnabled}
                      />
                    </div>

                    {wateringAlertsEnabled && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Dropdown
                          label={t("alertTime" as TranslationKey)}
                          items={alertOptions}
                          selectedItem={alertTime}
                          onSelect={setAlertTime}
                          variant="small"
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      <Button
                        variant="primary"
                        label={t("saveFloricultureSettings" as TranslationKey)}
                        onClick={handleSaveFloricultureSettings}
                        disabled={isSaving}
                      />
                    </div>

                    {successMessage && (
                      <p className="text-green-200 mt-2 text-sm">
                        {successMessage}
                      </p>
                    )}
                    {errorMessage && (
                      <p className="text-red-200 mt-2 text-sm">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default FloricultureSettings;

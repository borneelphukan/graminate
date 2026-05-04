import React, { useMemo } from "react";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator } from "@/translations";

const FloricultureSettings = () => {
  const { language: currentLanguage } = useUserPreferences();
  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  return (
    <>
      <Head>
        <title>{t("floricultureSettings")}</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-4 sm:px-6 md:px-12">
            <div className="py-6">
              <div className="pb-4 font-bold text-lg text-dark dark:text-light border-b border-gray-400 dark:border-gray-700">
                {t("floricultureSettings")}
              </div>
              <section className="py-8">
                <div className="bg-light dark:bg-gray-600 p-6 rounded-2xl border border-gray-400 dark:border-gray-600 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                    <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M12 15v1.5"/><path d="M16.5 12H15"/><path d="M9 12H7.5"/><path d="m15.182 8.818-1.061 1.061"/><path d="m9.879 14.121-1.061 1.061"/><path d="m15.182 15.182-1.061-1.061"/><path d="m9.879 9.879-1.061-1.061"/></svg>
                    </span>
                    <h3 className="font-bold">Preferences</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Floriculture specific settings and preferences will be available here soon. 
                    Customize your flower management, AI insight frequency, and display options.
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default FloricultureSettings;

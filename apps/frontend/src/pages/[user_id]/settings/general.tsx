import { Dropdown, Icon, Button } from "@graminate/ui";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import NavPanel from "@/components/layout/NavPanel";
import PlatformLayout from "@/layout/PlatformLayout";
import SettingsBar from "@/components/layout/SettingsBar";
import TextField from "@/components/ui/TextField";
import { LANGUAGES, TIME_FORMAT, UNITS } from "@/constants/options";
import Loader from "@/components/ui/Loader";
import axiosInstance from "@/lib/utils/axiosInstance";
import {
  useUserPreferences,
  TimeFormatOption,
} from "@/contexts/UserPreferencesContext";
import { getTranslator, SupportedLanguage, translations } from "@/translations";

type NavPanelTranslationKey = keyof typeof translations.English;

const General = () => {
  const router = useRouter();
  const { view, user_id } = router.query;
  const currentViewFromRouter = (view as string) || "profile";
  const userId = Array.isArray(user_id) ? user_id[0] : user_id;

  const {
    setTimeFormat: setContextTimeFormat,
    language: currentLanguage,
    setLanguage: setContextLanguage,
  } = useUserPreferences();

  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const [user, setUser] = useState({
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    language: currentLanguage,
    timeFormat: "24-hour" as TimeFormatOption,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [storageSettings, setStorageSettings] = useState({
    provider: "Amazon S3",
    bucketName: "",
    region: "",
    accessKeyId: "",
    secretAccessKey: "",
    maxFileSize: "10",
    publicAccess: "Private",
    // Physical Storage Defaults
    defaultWarehouseType: "Ambient Storage",
    capacityUnit: "sq. ft.",
    defaultInventoryUnit: "kg",
    globalLowStockThreshold: "5",
    enableLowStockAlerts: true,
  });

  useEffect(() => {
    if (!userId) {
      setIsLoadingPageData(false);
      return;
    }
    setIsLoadingPageData(true);
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const userData = response.data.user ?? response.data.data?.user;

        if (!userData) {
          throw new Error("User data not found in response");
        }

        const fetchedTimeFormat = (userData.time_format ||
          "24-hour") as TimeFormatOption;
        const fetchedLanguage = (userData.language ||
          "English") as SupportedLanguage;

        setUser({
          profilePicture: userData.profile_picture || "",
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phoneNumber: userData.phone_number || "",
          language: fetchedLanguage,
          timeFormat: fetchedTimeFormat,
          addressLine1: userData.address_line_1 || "",
          addressLine2: userData.address_line_2 || "",
          city: userData.city || "",
          state: userData.state || "",
          postalCode: userData.postal_code || "",
          country: userData.country || "",
        });
        setContextTimeFormat(fetchedTimeFormat);
        setContextLanguage(fetchedLanguage);
      } catch (error) {
        console.error("Error fetching user data for General page:", error);

        const defaultTimeFormat = "24-hour" as TimeFormatOption;
        const defaultLanguage = "English" as SupportedLanguage;

        setUser({
          profilePicture: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          language: defaultLanguage,
          timeFormat: defaultTimeFormat,
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
        setContextTimeFormat(defaultTimeFormat);
        setContextLanguage(defaultLanguage);
      } finally {
        setIsLoadingPageData(false);
      }
    };
    fetchUserData();
  }, [userId, setContextTimeFormat, setContextLanguage]);

  useEffect(() => {
    setUser((prevUser) => ({ ...prevUser, language: currentLanguage }));
  }, [currentLanguage]);

  const navButtons = useMemo(() => {
    const buttons = [
      { nameKey: "profile" as NavPanelTranslationKey, view: "profile" },
      { nameKey: "crm" as NavPanelTranslationKey, view: "crm" },
      { nameKey: "storage" as NavPanelTranslationKey, view: "storage" },
    ];
    return buttons.map((btn) => ({
      ...btn,
      name: t(btn.nameKey) || btn.nameKey,
    }));
  }, [t]);

  const changeView = (newView: string) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, view: newView },
      },
      undefined,
      { shallow: true }
    );
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");

  const handleSaveProfileChanges = async () => {
    if (!userId) return;
    setIsSavingProfile(true);
    setProfileSuccessMessage("");
    setProfileErrorMessage("");
    try {
      await axiosInstance.put(`/user/${userId}`, {
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        language: user.language,
        time_format: user.timeFormat,
        address_line_1: user.addressLine1,
        address_line_2: user.addressLine2,
        city: user.city,
        state: user.state,
        postal_code: user.postalCode,
        country: user.country,
      });
      setContextTimeFormat(user.timeFormat);
      setContextLanguage(user.language as SupportedLanguage);
      setProfileSuccessMessage(t("profileUpdateSuccess"));
    } catch (error: unknown) {
      const errorMessage = t("anUnknownErrorOccurred");
      setProfileErrorMessage(`${t("profileUpdateError")} ${errorMessage}`);
      console.error("Error updating profile:", errorMessage, error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const languageOptions = useMemo(() => {
    return LANGUAGES.map((lang) => ({
      value:
        typeof lang === "object" && "value" in (lang as { value: string })
          ? (lang as { value: string }).value
          : lang,
      label:
        typeof lang === "object" && "label" in (lang as { label: string })
          ? (lang as { label: string }).label
          : lang,
    }));
  }, []);

  const languageDropdownDisplayItems = useMemo(
    () => languageOptions.map((option) => option.label),
    [languageOptions]
  );

  const selectedLanguageLabel = useMemo(() => {
    const found = languageOptions.find(
      (option) => option.value === user.language
    );
    return found ? found.label : user.language;
  }, [user.language, languageOptions]);

  const handleLanguageSelect = (selectedLabel: string) => {
    const found = languageOptions.find(
      (option) => option.label === selectedLabel
    );
    if (found) {
      setUser((prev) => ({
        ...prev,
        language: found.value as SupportedLanguage,
      }));
    }
  };

  return (
    <>
      <Head>
        <title>{t("generalSettings")}</title>
      </Head>
      <PlatformLayout>
        <div className="flex min-h-screen">
          <SettingsBar />
          <main className="flex-1 px-4 sm:px-6 md:px-12">
            <div className="py-6">
              <div className="pb-4 font-bold text-lg text-dark dark:text-light">
                {t("generalSettings")}
              </div>
              <NavPanel
                buttons={navButtons}
                activeView={currentViewFromRouter}
                onNavigate={(newView: string) => changeView(newView)}
              />
              {isLoadingPageData ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : (
                <section className="py-6">
                  {currentViewFromRouter === "profile" && (
                    <div>
                      <div className="rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4 dark:text-light">
                          {t("profileSettings")}
                        </h2>
                        <p className="text-gray-300 mb-6">
                          {t("profileSettingsDescription")}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 max-w-lg">
                        <TextField
                          label={t("firstName")}
                          placeholder={t("enterFirstName")}
                          value={user.firstName}
                          onChange={(val) =>
                            setUser((prev) => ({ ...prev, firstName: val }))
                          }
                          width="large"
                          isDisabled={true}
                        />
                        <TextField
                          label={t("lastName")}
                          placeholder={t("enterLastName")}
                          value={user.lastName}
                          onChange={(val) =>
                            setUser((prev) => ({ ...prev, lastName: val }))
                          }
                          width="large"
                          isDisabled={true}
                        />
                        <div className="flex gap-4">
                          <Dropdown
                            label={t("language")}
                            items={languageDropdownDisplayItems}
                            selectedItem={selectedLanguageLabel}
                            onSelect={handleLanguageSelect}
                          />
                          <Dropdown
                            label={t("timeFormat")}
                            items={TIME_FORMAT.map((tf) => String(tf))}
                            selectedItem={user.timeFormat}
                            onSelect={(val) =>
                              setUser((prev) => ({
                                ...prev,
                                timeFormat: val as TimeFormatOption,
                              }))
                            }
                          />
                        </div>
                        <TextField
                          label={t("phoneNumber")}
                          placeholder={t("enterPhoneNumber")}
                          value={user.phoneNumber}
                          onChange={(val) =>
                            setUser((prev) => ({ ...prev, phoneNumber: val }))
                          }
                          width="large"
                        />
                      </div>

                      <div className="mt-6 rounded-lg p-0">
                        <h3 className="text-md font-semibold mb-4 dark:text-light">
                          {t("addressDetails" as NavPanelTranslationKey) ||
                            "Address Details"}
                        </h3>
                        <div className="flex flex-col gap-4 max-w-lg">
                          <TextField
                            label={
                              t("addressLine1" as NavPanelTranslationKey) ||
                              "Address Line 1"
                            }
                            placeholder={
                              t(
                                "enterAddressLine1" as NavPanelTranslationKey
                              ) || "Enter Address Line 1"
                            }
                            value={user.addressLine1}
                            onChange={(val) =>
                              setUser((prev) => ({
                                ...prev,
                                addressLine1: val,
                              }))
                            }
                            width="large"
                          />
                          <TextField
                            label={
                              t("addressLine2" as NavPanelTranslationKey) ||
                              "Address Line 2 (Optional)"
                            }
                            placeholder={
                              t(
                                "enterAddressLine2" as NavPanelTranslationKey
                              ) || "Enter Address Line 2"
                            }
                            value={user.addressLine2}
                            onChange={(val) =>
                              setUser((prev) => ({
                                ...prev,
                                addressLine2: val,
                              }))
                            }
                            width="large"
                          />
                          <div className="flex gap-4">
                            <TextField
                              label={
                                t("city" as NavPanelTranslationKey) || "City"
                              }
                              placeholder={
                                t("enterCity" as NavPanelTranslationKey) ||
                                "Enter City"
                              }
                              value={user.city}
                              onChange={(val) =>
                                setUser((prev) => ({ ...prev, city: val }))
                              }
                              width="medium"
                            />
                            <TextField
                              label={
                                t("state" as NavPanelTranslationKey) ||
                                "State/Province"
                              }
                              placeholder={
                                t("enterState" as NavPanelTranslationKey) ||
                                "Enter State/Province"
                              }
                              value={user.state}
                              onChange={(val) =>
                                setUser((prev) => ({ ...prev, state: val }))
                              }
                              width="medium"
                            />
                          </div>
                          <TextField
                            label={
                              t("postalCode" as NavPanelTranslationKey) ||
                              "Postal Code"
                            }
                            placeholder={
                              t("enterPostalCode" as NavPanelTranslationKey) ||
                              "Enter Postal Code"
                            }
                            value={user.postalCode}
                            onChange={(val) =>
                              setUser((prev) => ({ ...prev, postalCode: val }))
                            }
                            width="medium"
                          />
                          <TextField
                            label={
                              t("country" as NavPanelTranslationKey) ||
                              "Country"
                            }
                            placeholder={
                              t("enterCountry" as NavPanelTranslationKey) ||
                              "Enter Country"
                            }
                            value={user.country}
                            onChange={(val) =>
                              setUser((prev) => ({ ...prev, country: val }))
                            }
                            width="medium"
                            isDisabled={true}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="primary"
                          label={t("saveChanges")}
                          onClick={handleSaveProfileChanges}
                          disabled={isSavingProfile}
                        />
                      </div>
                      {profileSuccessMessage && (
                        <p className="text-green-200 mt-2">
                          {profileSuccessMessage}
                        </p>
                      )}
                      {profileErrorMessage && (
                        <p className="text-red-200 mt-2">
                          {profileErrorMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {currentViewFromRouter === "crm" && (
                    <div className="rounded-lg p-0">
                      <h2 className="text-lg font-semibold mb-4 dark:text-light">
                        {t("crmSettings" as NavPanelTranslationKey)}
                      </h2>
                      <p className="text-gray-300 mb-6">
                        {t("crmSettingsDescription" as NavPanelTranslationKey)}
                      </p>
                      <p className="dark:text-light">
                        CRM specific settings and configurations will go here.
                      </p>
                    </div>
                  )}

                  {currentViewFromRouter === "storage" && (
                    <div className="rounded-lg p-0">
                      <h2 className="text-lg font-semibold mb-4 dark:text-light">
                        {t("storageSettings" as NavPanelTranslationKey) || "Storage Settings"}
                      </h2>
                      <p className="text-gray-300 mb-6">
                        {t("storageSettingsDescription" as NavPanelTranslationKey) || "Configure your cloud storage provider and bucket details for file uploads."}
                      </p>
                      
                      <div className="flex flex-col gap-6 max-w-lg">

                        {/* Physical Storage & Warehouse Section */}
                        <div className="border-b border-gray-700 pb-6">
                          <h3 className="text-sm font-semibold mb-4 text-gray-200 uppercase tracking-wider">{t("warehouseSettings" as NavPanelTranslationKey) || "Warehouse & Inventory"}</h3>
                          <div className="flex flex-col gap-4">
                            <Dropdown
                              label={t("defaultWarehouseType" as NavPanelTranslationKey) || "Default Warehouse Type"}
                              items={["Ambient Storage", "Cold Storage", "Climate Controlled Storage", "Bulk Silo Storage", "Packhouse"]}
                              selectedItem={storageSettings.defaultWarehouseType}
                              onSelect={(val) => setStorageSettings(prev => ({ ...prev, defaultWarehouseType: val }))}
                            />
                            
                            <Dropdown
                              label={t("capacityUnit" as NavPanelTranslationKey) || "Area/Capacity Unit"}
                              items={["sq. ft.", "sq. meters", "cubic meters"]}
                              selectedItem={storageSettings.capacityUnit}
                              onSelect={(val) => setStorageSettings(prev => ({ ...prev, capacityUnit: val }))}
                            />

                            <Dropdown
                              label={t("defaultInventoryUnit" as NavPanelTranslationKey) || "Default Inventory Unit"}
                              items={UNITS}
                              selectedItem={storageSettings.defaultInventoryUnit}
                              onSelect={(val) => setStorageSettings(prev => ({ ...prev, defaultInventoryUnit: val }))}
                            />

                            <TextField
                              label={t("globalLowStockThreshold" as NavPanelTranslationKey) || "Global Low Stock Threshold"}
                              placeholder="5"
                              number
                              value={storageSettings.globalLowStockThreshold}
                              onChange={(val) => setStorageSettings(prev => ({ ...prev, globalLowStockThreshold: val }))}
                              width="medium"
                            />

                            <div className="flex items-center gap-3 py-2">
                              <input 
                                type="checkbox" 
                                id="enableAlerts"
                                checked={storageSettings.enableLowStockAlerts}
                                onChange={(e) => setStorageSettings(prev => ({ ...prev, enableLowStockAlerts: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-200 focus:ring-green-500"
                              />
                              <label htmlFor="enableAlerts" className="text-sm text-gray-200">
                                {t("enableLowStockAlerts" as NavPanelTranslationKey) || "Enable low stock visual alerts in warehouse dashboard"}
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Button
                          variant="primary"
                          label={t("saveStorageSettings")}
                          onClick={() => {
                            setProfileSuccessMessage(t("saveStorageSettings") + " " + t("profileUpdateSuccess"));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </main>
        </div>
      </PlatformLayout>
    </>
  );
};

export default General;

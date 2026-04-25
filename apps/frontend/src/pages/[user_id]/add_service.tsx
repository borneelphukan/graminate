import React, { useState, useEffect, useMemo, JSX } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "@/components/ui/Loader";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator } from "@/translations";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { Button } from "@graminate/ui";
import { showToast, toastMessage } from "@/stores/toast";
import TextField from "@/components/ui/TextField";
import PasswordModal from "@/components/modals/PasswordModal";
import BeeIcon from "@/icons/BeeIcon";
import PoultryIcon from "@/icons/PoultryIcon";
import CattleIcon from "@/icons/CattleIcon";
import FlowerIcon from "@/icons/FlowerIcon";

type ServiceConfig = {
  [key: string]: {
    endpoint: string;
    occupation: string;
  };
};

const SERVICE_CONFIG: ServiceConfig = {
  "Cattle Rearing": {
    endpoint: "cattle-rearing",
    occupation: "Cattle Rearing",
  },
  Poultry: {
    endpoint: "flock",
    occupation: "Poultry",
  },
  Apiculture: {
    endpoint: "apiculture",
    occupation: "Apiculture",
  },
  Floriculture: {
    endpoint: "floriculture",
    occupation: "Floriculture",
  },
};

const AddServicePage = () => {
  const router = useRouter();
  const { user_id } = router.query;

  const { language, subTypes, setUserSubTypes, plan } = useUserPreferences();
  const t = useMemo(() => getTranslator(language), [language]);

  const [availableSubTypes, setAvailableSubTypes] = useState<string[]>([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState<Set<string>>(
    new Set()
  );
  const [servicesToRemove, setServicesToRemove] = useState<Set<string>>(
    new Set()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const AgricultureIcons: Record<string, JSX.Element> = {
    Poultry: <PoultryIcon />,
    "Cattle Rearing": <CattleIcon />,
    Apiculture: <BeeIcon />,
    Floriculture: <FlowerIcon />,
  };

  const isProFeature = plan === "FREE" && subTypes.length >= 1;

  useEffect(() => {
    if (!user_id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [availableResponse, userResponse] = await Promise.all([
          axiosInstance.get(`/user/${user_id}/available-sub-types`),
          axiosInstance.get(`/user/${user_id}`),
        ]);
        const available = availableResponse.data?.data?.subTypes;
        if (!Array.isArray(available)) {
          throw new Error("Available sub-types not found.");
        }
        const user = userResponse.data?.data?.user ?? userResponse.data?.user;
        setUserData(user);
        setAvailableSubTypes(available);
      } catch (error) {
        console.error("Failed to fetch available service data:", error);
        toastMessage.set({
          message: "Failed to load service information. Please try again.",
          type: "error",
        });
        showToast.set(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  const handleAddCheckboxChange = (subType: string) => {
    if (isProFeature) return;
    
    setSelectedSubTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subType)) {
        newSet.delete(subType);
      } else {
        // If FREE plan, only allow 1 total service (existing + selected)
        if (plan === "FREE" && subTypes.length + newSet.size >= 1) {
          toastMessage.set({
            message: "Free plan users can only have one active service. Please upgrade for more.",
            type: "error",
          });
          showToast.set(true);
          return prev;
        }
        newSet.add(subType);
      }
      return newSet;
    });
  };

  const handleRemoveCheckboxChange = (subType: string) => {
    setServicesToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subType)) {
        newSet.delete(subType);
      } else {
        newSet.add(subType);
      }
      return newSet;
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubTypes.size === 0 || isProFeature) return;

    setIsSubmitting(true);
    const newSubTypes = [
      ...new Set([...subTypes, ...Array.from(selectedSubTypes)]),
    ];

    try {
      await axiosInstance.put(`/user/${user_id}`, {
        sub_type: newSubTypes,
      });

      // Create a warehouse for each newly added service
      const warehouseCreationPromises = Array.from(selectedSubTypes).map((subType) => {
        const payload = {
          user_id: parseInt(user_id as string, 10),
          name: `${subType} Warehouse`,
          type: "Ambient Storage",
          address_line_1: userData?.address_line_1 || "",
          address_line_2: userData?.address_line_2 || "",
          city: userData?.city || "",
          state: userData?.state || "",
          postal_code: userData?.postal_code || "",
          country: userData?.country || "India",
          category: subType,
        };
        return axiosInstance.post("/warehouse/add", payload);
      });

      if (warehouseCreationPromises.length > 0) {
        const results = await Promise.allSettled(warehouseCreationPromises);
        const failures = results.filter((r) => r.status === "rejected");
        
        if (failures.length > 0) {
          console.error("Some warehouse creations failed:", failures);
          const firstFailure: any = failures[0];
          const serverMessage = firstFailure.reason?.response?.data?.message || firstFailure.reason?.message;
          throw new Error(serverMessage || "Failed to create some warehouses.");
        }
      }

      toastMessage.set({
        message: "Services and warehouses created successfully!",
        type: "success",
      });
      showToast.set(true);
      setUserSubTypes(newSubTypes);
      setSelectedSubTypes(new Set());
    } catch (error: any) {
      console.error("Failed to add user services or create warehouses:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to add services. Please try again.";
      toastMessage.set({
        message: errorMessage,
        type: "error",
      });
      showToast.set(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeRemoveServices = async () => {
    if (servicesToRemove.size === 0 || !user_id) return;

    setIsRemoving(true);
    const newSubTypes = subTypes.filter(
      (subType) => !servicesToRemove.has(subType)
    );

    try {
      await axiosInstance.put(`user/${user_id}`, {
        sub_type: newSubTypes,
      });

      const userIdNumber = parseInt(user_id as string, 10);
      const deletionPromises = [];

      for (const service of servicesToRemove) {
        const config = SERVICE_CONFIG[service];
        if (config) {
          deletionPromises.push(
            axiosInstance.post(`${config.endpoint}/reset-service`, {
              userId: userIdNumber,
            })
          );
          deletionPromises.push(
            axiosInstance.post("sales/delete-by-occupation", {
              userId: userIdNumber,
              occupation: config.occupation,
            })
          );
          deletionPromises.push(
            axiosInstance.post("expenses/delete-by-occupation", {
              userId: userIdNumber,
              occupation: config.occupation,
            })
          );
          deletionPromises.push(
            axiosInstance.delete(
              `warehouse/delete-by-category/${userIdNumber}/${service}`
            )
          );
        }
      }

      if (deletionPromises.length > 0) {
        await Promise.all(deletionPromises);
      }

      toastMessage.set({
        message: "Service(s) removed successfully!",
        type: "success",
      });
      showToast.set(true);
      setUserSubTypes(newSubTypes);
      setServicesToRemove(new Set());
    } catch (error) {
      console.error("Failed to remove services or related data:", error);
      toastMessage.set({
        message:
          "Failed to remove services. Some related data may not have been cleared. Please try again.",
        type: "error",
      });
      showToast.set(true);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleOpenConfirmationModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (servicesToRemove.size > 0) {
      setModalError(null);
      setPassword("");
      setIsModalOpen(true);
    }
  };

  const handleConfirmRemoval = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingPassword(true);
    setModalError(null);

    try {
      const response = await axiosInstance.post(
        `/user/verify-password/${user_id}`,
        { password }
      );

      if (response.data.valid) {
        setIsModalOpen(false);
        setPassword("");
        await executeRemoveServices();
      } else {
        setModalError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      setModalError("Failed to verify password. Please check and try again.");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const servicesToShow = availableSubTypes.filter(
    (subType) => !subTypes.includes(subType)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Add Service</title>
      </Head>
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConfirmRemoval}
        title="Confirm Password"
        footerContent={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              label="Cancel"
              disabled={isVerifyingPassword}
            />
            <Button
              type="submit"
              variant="destructive"
              label={isVerifyingPassword ? "Verifying..." : "Remove Service"}
              disabled={isVerifyingPassword || !password}
            />
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Enter password to remove selected service(s) and all related data.
        </p>
        <TextField
          label="Password"
          placeholder="Enter your password"
          password={true}
          value={password}
          onChange={setPassword}
          width="large"
          type={modalError ? "error" : ""}
          errorMessage={modalError || ""}
          isDisabled={isVerifyingPassword}
        />
      </PasswordModal>

      <div className="p-4 sm:p-6">
        <header className="mb-4">
          <h1 className="text-lg font-semibold text-dark dark:text-light">
            Manage Your Services
          </h1>
          <p className="text-dark dark:text-light">
            Add or remove services based on your agricultural needs.
          </p>
        </header>
        <hr className="mb-6 border-gray-400 dark:border-gray-700" />

        {servicesToShow.length > 0 ? (
          <form onSubmit={handleAddSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Add Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {servicesToShow.map((subType) => {
                  const isSelected = selectedSubTypes.has(subType);
                  const isDisabled = 
                    isProFeature || 
                    (plan === "FREE" && selectedSubTypes.size >= 1 && !isSelected);

                  return (
                    <label
                      key={subType}
                      htmlFor={`add-subtype-${subType}`}
                      className={`relative flex flex-col items-center justify-center text-center p-4 border rounded-xl 
                                     transition-all duration-200 ease-in-out group
                                     ${
                                       isDisabled
                                         ? "cursor-not-allowed bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 opacity-60"
                                         : `cursor-pointer hover:border-green-200 dark:hover:border-green-100 ${
                                             isSelected
                                               ? "bg-green-400 dark:bg-green-100/30 border-green-200 dark:border-green-100 shadow-lg"
                                               : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-light dark:hover:bg-gray-600/50"
                                           }`
                                     }`}
                    >
                      {(isProFeature || (plan === "FREE" && isDisabled)) && (
                        <div className="absolute top-2 right-2 bg-green-200 text-light text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {isProFeature ? "Unlock Pro" : "1 Limit"}
                        </div>
                      )}
                      <input
                        type="checkbox"
                        id={`add-subtype-${subType}`}
                        name="addSubType"
                        value={subType}
                        checked={isSelected}
                        onChange={() => handleAddCheckboxChange(subType)}
                        className="sr-only peer"
                        disabled={isDisabled}
                      />
                      <div
                        className={`w-10 h-10 mb-3 flex items-center justify-center text-3xl
                                        transition-colors duration-200 
                                        ${
                                          isDisabled
                                            ? "text-gray-300 dark:text-gray-500"
                                            : isSelected
                                            ? "text-green-100 dark:text-green-300"
                                            : "text-gray-400 dark:text-gray-300 group-hover:text-green-200 dark:group-hover:text-green-200 peer-focus:text-green-200 dark:peer-focus:text-green-200"
                                        }`}
                      >
                        {AgricultureIcons[subType]}
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          isDisabled
                            ? "text-dark dark:text-light"
                            : isSelected
                            ? "text-green-100 dark:text-green-300"
                            : "text-dark dark:text-light group-hover:text-green-200 dark:group-hover:text-green-200 peer-focus:text-green-100 dark:peer-focus:text-green-200"
                        }`}
                      >
                        {subType}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isSubmitting || selectedSubTypes.size === 0 || isProFeature
                }
                label={
                  isProFeature
                    ? "Upgrade to Add Services"
                    : isSubmitting
                    ? "Adding..."
                    : "Add Selected Services"
                }
              />
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Available Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {"You have subscribed to all available services."}
            </p>
          </div>
        )}

        {subTypes.length > 0 && (
          <>
            <hr className="my-10 border-gray-300 dark:border-gray-600" />
            <form onSubmit={handleOpenConfirmationModal}>
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Current Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {subTypes.map((subType) => (
                    <label
                      key={subType}
                      htmlFor={`remove-subtype-${subType}`}
                      className={`flex flex-col items-center justify-center text-center p-4 border rounded-xl cursor-pointer 
                                    transition-all duration-200 ease-in-out group
                                    hover:border-red-500 dark:hover:border-red-400
                                    ${
                                      servicesToRemove.has(subType)
                                        ? "bg-red-400 dark:bg-red-900/50 border-red-200 dark:border-red-200 shadow-lg"
                                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-light dark:hover:bg-gray-600/50"
                                    }`}
                    >
                      <input
                        type="checkbox"
                        id={`remove-subtype-${subType}`}
                        name="removeSubType"
                        value={subType}
                        checked={servicesToRemove.has(subType)}
                        onChange={() => handleRemoveCheckboxChange(subType)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-10 h-10 mb-3 flex items-center justify-center text-3xl
                                       transition-colors duration-200 
                                       ${
                                         servicesToRemove.has(subType)
                                           ? "text-red-100 dark:text-red-300"
                                           : "text-gray-300 dark:text-gray-300 group-hover:text-red-200 dark:group-hover:text-red-400 peer-focus:text-red-200 dark:peer-focus:text-red-400"
                                       }`}
                      >
                        {AgricultureIcons[subType]}
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          servicesToRemove.has(subType)
                            ? "text-red-100 dark:text-red-300"
                            : "text-gray-800 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 peer-focus:text-red-100 dark:peer-focus:text-red-400"
                        }`}
                      >
                        {subType}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isRemoving || servicesToRemove.size === 0}
                  label={isRemoving ? "Removing..." : "Remove Selected Services"}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </PlatformLayout>
  );
};

export default AddServicePage;

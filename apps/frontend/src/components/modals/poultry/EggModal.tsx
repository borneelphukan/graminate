import { Icon, Button, Input, Table } from "@graminate/ui";
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import InfoModal from "../InfoModal";
import { format, parseISO } from "date-fns";
import { useTableActions } from "@/hooks/useTableActions";


type EggRecord = {
  egg_id?: number;
  date_collected: string;
  small_eggs: number;
  medium_eggs: number;
  large_eggs: number;
  extra_large_eggs: number;
  broken_eggs: number;
  total_eggs?: number;
  date_logged?: string;
};

type EggModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  flockId: number;
  userId: number;
  eggRecordToEdit?: EggRecord | null;
  allEggRecords?: EggRecord[];
  onRecordSaved: () => void;
};

const EggModal = ({
  isOpen,
  onClose,
  formTitle,
  flockId,
  userId,
  eggRecordToEdit,
  allEggRecords,
  onRecordSaved,
}: EggModalProps) => {
  const [internalRecordToEdit, setInternalRecordToEdit] = useState<EggRecord | null>(null);
  const [showTable, setShowTable] = useState(false);

  const [dateCollected, setDateCollected] = useState("");
  const [smallEggs, setSmallEggs] = useState<number | string>("");
  const [mediumEggs, setMediumEggs] = useState<number | string>("");
  const [largeEggs, setLargeEggs] = useState<number | string>("");
  const [extraLargeEggs, setExtraLargeEggs] = useState<number | string>("");
  const [brokenEggs, setBrokenEggs] = useState<number | string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EggRecord, string>>
  >({});

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { handleDeleteRows } = useTableActions("poultry_eggs");

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

  const resetForm = () => {
    setDateCollected(new Date().toISOString().split("T")[0]);
    setSmallEggs("");
    setMediumEggs("");
    setLargeEggs("");
    setExtraLargeEggs("");
    setBrokenEggs("");
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      setInternalRecordToEdit(eggRecordToEdit || null);
    } else {
      setShowTable(false);
    }
  }, [isOpen, eggRecordToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (internalRecordToEdit) {
        setDateCollected(
          internalRecordToEdit.date_collected
            ? new Date(internalRecordToEdit.date_collected)
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setSmallEggs(internalRecordToEdit.small_eggs?.toString() ?? "");
        setMediumEggs(internalRecordToEdit.medium_eggs?.toString() ?? "");
        setLargeEggs(internalRecordToEdit.large_eggs?.toString() ?? "");
        setExtraLargeEggs(internalRecordToEdit.extra_large_eggs?.toString() ?? "");
        setBrokenEggs(internalRecordToEdit.broken_eggs?.toString() ?? "");
      } else {
        resetForm();
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [internalRecordToEdit, isOpen]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EggRecord, string>> = {};
    if (!dateCollected) newErrors.date_collected = "Date is required";

    const checkNonNegativeInteger = (
      value: number | string,
      fieldName: keyof EggRecord
    ) => {
      const num = Number(value);
      if (value !== "" && (isNaN(num) || num < 0 || !Number.isInteger(num))) {
        newErrors[fieldName] = "Must be a non-negative whole number";
      }
    };

    checkNonNegativeInteger(smallEggs, "small_eggs");
    checkNonNegativeInteger(mediumEggs, "medium_eggs");
    checkNonNegativeInteger(largeEggs, "large_eggs");
    checkNonNegativeInteger(extraLargeEggs, "extra_large_eggs");
    checkNonNegativeInteger(brokenEggs, "broken_eggs");

    const sE = Number(smallEggs) || 0;
    const mE = Number(mediumEggs) || 0;
    const lE = Number(largeEggs) || 0;
    const xlE = Number(extraLargeEggs) || 0;

    if (sE === 0 && mE === 0 && lE === 0 && xlE === 0) {
      newErrors.small_eggs =
        "At least one egg size (Small, Medium, Large, or Extra Large) quantity is required and must be > 0 if others are 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      user_id: userId,
      flock_id: flockId,
      date_collected: dateCollected,
      small_eggs: Number(smallEggs) || 0,
      medium_eggs: Number(mediumEggs) || 0,
      large_eggs: Number(largeEggs) || 0,
      extra_large_eggs: Number(extraLargeEggs) || 0,
      broken_eggs: Number(brokenEggs) || 0,
    };

    try {
      if (internalRecordToEdit && internalRecordToEdit.egg_id) {
        await axiosInstance.put(
          `/poultry-eggs/update/${internalRecordToEdit.egg_id}`,
          payload
        );
      } else {
        await axiosInstance.post("/poultry-eggs/add", payload);
      }
      onRecordSaved();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving egg record:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : error instanceof Error
          ? error.message
          : "Failed to save egg record.";
      setInfoModalState({
        isOpen: true,
        title: "Error",
        text: errorMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const records = allEggRecords || [];
    if (!searchQuery) return records;
    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [allEggRecords, searchQuery]);

  const tableData = useMemo(() => {
    const columns = [
      "#",
      "Date Collected",
      "Small",
      "Medium",
      "Large",
      "XL",
      "Total",
      "Broken",
      "Date Logged",
    ];
    const rows = filteredRecords.map((record) => [
      record.egg_id,
      record.date_collected ? format(parseISO(record.date_collected), "PP") : "N/A",
      record.small_eggs,
      record.medium_eggs,
      record.large_eggs,
      record.extra_large_eggs,
      record.total_eggs ?? (Number(record.small_eggs) + Number(record.medium_eggs) + Number(record.large_eggs) + Number(record.extra_large_eggs)),
      record.broken_eggs,
      record.date_logged ? format(parseISO(record.date_logged), "PPpp") : "N/A",
    ]);
    return { columns, rows };
  }, [filteredRecords]);

  if (!isOpen) {
    return null;
  }

  const handleRowClick = (row: any[]) => {
    const recordId = row[0] as number;
    const record = allEggRecords?.find((r) => r.egg_id === recordId);
    if (record) {
      setInternalRecordToEdit(record);
      setShowTable(false);
    }
  };

  const currentTitle = showTable 
    ? `Egg Records for ${formTitle.replace("Log Egg Collection for ", "").replace("Edit Egg Record for ", "")}`
    : (internalRecordToEdit ? formTitle.replace("Log Egg Collection", "Edit Egg Record") : formTitle);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={`rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full ${showTable ? "max-w-5xl" : "max-w-lg"} mx-4 transition-all duration-300`}>
          <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-400/20 shadow-sm p-6 md:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
            <h3 className="text-xl font-semibold">
              {currentTitle}
            </h3>
              <Button
                variant="ghost"
                icon={{ left: "close" }}
                onClick={onClose}
                aria-label="Close modal"
                size="sm"
              />
          </div>

          {showTable ? (
            <div className="mt-4 overflow-x-auto min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Historical Collection Data
                </h4>
                <Button
                  variant="secondary"
                  label="Add Record"
                  icon={{ left: "add" }}
                  size="sm"
                  onClick={() => {
                    setInternalRecordToEdit(null);
                    setShowTable(false);
                  }}
                />
              </div>
                <Table
                data={tableData}
                filteredRows={tableData.rows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                paginationItems={["10 per page", "25 per page", "50 per page"]}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalRecordCount={filteredRecords.length}
                onRowClick={handleRowClick}
                view="poultry_eggs"
                loading={false}
                onDeleteRows={async (ids) => {
                  await handleDeleteRows(ids);
                  onRecordSaved();
                }}
              />
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="date-collected"
                label="Date Collected"
                type="date"
                value={dateCollected}
                onChange={(e) => setDateCollected(e.target.value)}
                error={errors.date_collected}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="small-eggs"
                  label="Small Eggs"
                  type="number"
                  placeholder="e.g., 10"
                  value={smallEggs === 0 ? "" : String(smallEggs)}
                  onChange={(e) => setSmallEggs(e.target.value)}
                  error={errors.small_eggs}
                />
                <Input
                  id="medium-eggs"
                  label="Medium Eggs"
                  type="number"
                  placeholder="e.g., 20"
                  value={mediumEggs === 0 ? "" : String(mediumEggs)}
                  onChange={(e) => setMediumEggs(e.target.value)}
                  error={errors.medium_eggs}
                />
                <Input
                  id="large-eggs"
                  label="Large Eggs"
                  type="number"
                  placeholder="e.g., 15"
                  value={largeEggs === 0 ? "" : String(largeEggs)}
                  onChange={(e) => setLargeEggs(e.target.value)}
                  error={errors.large_eggs}
                />
                <Input
                  id="extra-large-eggs"
                  label="Extra Large Eggs"
                  type="number"
                  placeholder="e.g., 5"
                  value={extraLargeEggs === 0 ? "" : String(extraLargeEggs)}
                  onChange={(e) => setExtraLargeEggs(e.target.value)}
                  error={errors.extra_large_eggs}
                />
              </div>
              <Input
                id="broken-eggs"
                label="Broken Eggs"
                type="number"
                placeholder="e.g., 2"
                value={brokenEggs === 0 ? "" : String(brokenEggs)}
                onChange={(e) => setBrokenEggs(e.target.value)}
                error={errors.broken_eggs}
              />

              <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-400 dark:border-gray-600">
                                <Button
                  label={
                    isSubmitting
                      ? "Saving..."
                      : internalRecordToEdit
                      ? "Update Record"
                      : "Add Record"
                  }
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                />
                <Button
                  variant="secondary"
                  label="View All"
                  onClick={() => setShowTable(true)}
                  disabled={isSubmitting}
                />
                <Button
                  label="Cancel"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
      <InfoModal
        isOpen={infoModalState.isOpen}
        onClose={() =>
          setInfoModalState((prev) => ({ ...prev, isOpen: false }))
        }
        title={infoModalState.title}
        text={infoModalState.text}
        variant={infoModalState.variant}
      />
    </>
  );
};

export default EggModal;

import axiosInstance from "@/lib/utils/axiosInstance";

import { RowType } from "@graminate/ui";

export const useTableActions = (view: string, setPopup?: (modal: any) => void) => {
  const handleDeleteRows = async (selectedRows: RowType[]) => {
    const rowsToDelete: number[] = [];
    selectedRows.forEach((row) => {
      const id = row[0];
      const numericId = Number(id);
      if (!isNaN(numericId)) rowsToDelete.push(numericId);
    });

    if (rowsToDelete.length === 0) return;

    const entityNames: Record<string, string> = {
      companies: "company",
      contacts: "contact",
      labours: "labour",
      inventory: "inventory",
      warehouse: "warehouse",
      contracts: "contract",
      receipts: "receipt",
      tasks: "tasks",
      labour_payment: "labour payment",
      flock: "flock",
      poultry_health: "poultry-health",
      poultry_eggs: "poultry-eggs",
      poultry_feeds: "poultry-feeds",
      cattle: "cattle records",
      cattle_milk: "cattle-milk",
      apiculture: "apiculture",
      hives: "hives",
      inspections: "hive-inspections",
    };

    const entityToDelete = entityNames[view] || view;
    const pluralEntity = rowsToDelete.length > 1 ? `${entityToDelete}s` : entityToDelete;

    try {
      const endpointMap: Record<string, string> = {
        contacts: "contacts",
        companies: "companies",
        contracts: "contracts",
        receipts: "receipts",
        tasks: "tasks",
        labour: "labour",
        inventory: "inventory",
        warehouse: "warehouse",
        flock: "flock",
        poultry_health: "poultry-health",
        poultry_eggs: "poultry-eggs",
        poultry_feeds: "poultry-feeds",
        cattle: "cattle-rearing",
        cattle_milk: "cattle-milk",
        apiculture: "apiculture",
        hives: "bee-hives",
        inspections: "hive-inspections",
        labour_payment: "labour_payment",
      };

      const endpoint = endpointMap[view] || "inventory";

      await Promise.all(
        rowsToDelete.map(async (id) => {
          await axiosInstance.delete(`${endpoint}/delete/${id}`);
        })
      );

      location.reload();
    } catch (error) {
      console.error("Error deleting rows:", error);
      if (setPopup) {
        setPopup({
          isOpen: true,
          title: "Error",
          text: "Failed to delete selected rows.",
          variant: "error",
        });
      }
    }
  };

  return {
    handleDeleteRows,
  };
};

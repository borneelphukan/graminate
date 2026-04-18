import axiosInstance from "@/lib/utils/axiosInstance";
import Swal from "sweetalert2";

export type RowType = unknown[];

export const useTableActions = (view: string) => {
  const handleDeleteRows = async (selectedRows: RowType[]) => {
    const rowsToDelete: number[] = [];
    selectedRows.forEach((row) => {
      const id = (row as any[])[0];
      if (typeof id === "number") rowsToDelete.push(id);
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

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the selected ${pluralEntity}?`,
      icon: "warning",
      confirmButtonColor: "#04ad79",
      cancelButtonColor: "#bbbbbc",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
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
        };

        const endpoint = endpointMap[view] || "inventory";

        await Promise.all(
          rowsToDelete.map(async (id) => {
            await axiosInstance.delete(`/${endpoint}/delete/${id}`);
          })
        );

        location.reload();
      } catch (error) {
        console.error("Error deleting rows:", error);
        await Swal.fire("Error", "Failed to delete selected rows.", "error");
      }
    }
  };

  const handleResetTable = async () => {
    const entityNames: Record<string, string> = {
      contacts: "contacts",
      companies: "companies",
      contracts: "contracts",
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
    };

    const entityToTruncate = entityNames[view] || view;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will reset your ${entityToTruncate} records.`,
      icon: "warning",
      confirmButtonColor: "#04ad79",
      cancelButtonColor: "#bbbbbc",
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const userId = localStorage.getItem("userId");
        await axiosInstance.post(`/${entityToTruncate}/reset`, { userId });
        window.location.reload();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to reset table.", "error");
      }
    }
  };

  return {
    handleDeleteRows,
    handleResetTable,
  };
};

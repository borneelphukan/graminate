import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Popup, Button, Table, Icon, Dropdown, Badge } from "@graminate/ui";
import PlatformLayout from "@/layout/PlatformLayout";
import { useTableActions } from "@/hooks/useTableActions";
import { PAGINATION_ITEMS } from "@/constants/options";
import Head from "next/head";
import axiosInstance from "@/lib/utils/axiosInstance";
import WarehouseForm from "@/components/form/WarehouseForm";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

type View = "warehouse";

type WarehouseRecord = {
  warehouse_id: number;
  user_id?: number;
  name: string;
  type: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_person: string | null;
  phone: string | null;
  storage_capacity: number | string | null;
};

const WarehousePage = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;
  const view: View = "warehouse";

  const [warehouseRecords, setWarehouseRecords] = useState<WarehouseRecord[]>(
    []
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });
  const { userType } = useUserPreferences();
  const isAllowedUser = userType === "Seller" || userType === "Producer";

  const [unassignedItems, setUnassignedItems] = useState<any[]>([]);
  const [pendingSelections, setPendingSelections] = useState<Record<number, string>>({});
  const [isAssigning, setIsAssigning] = useState<number | null>(null);

  const { handleDeleteRows } = useTableActions(view, setPopup);

  const fetchUnassignedItems = async () => {
    if (!parsedUserId || !isAllowedUser) return;
    try {
      const res = await axiosInstance.get(`/inventory/${parsedUserId}?unassigned=true`);
      setUnassignedItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch unassigned items:", err);
    }
  };

  useEffect(() => {
    if (router.isReady && parsedUserId && isAllowedUser) {
      fetchUnassignedItems();
    }
  }, [router.isReady, parsedUserId, isAllowedUser]);

  const handleAssignWarehouse = async (inventoryId: number) => {
    const selectedLabel = pendingSelections[inventoryId];
    if (!selectedLabel) {
      setPopup({
        isOpen: true,
        title: "Selection Needed",
        text: "Please select a target warehouse first.",
        variant: "warning",
      });
      return;
    }

    const warehouseId = warehouseOptions.map[selectedLabel];

    if (!warehouseId) {
      setPopup({
        isOpen: true,
        title: "Error",
        text: "Could not find selected warehouse ID.",
        variant: "error",
      });
      return;
    }

    setIsAssigning(inventoryId);
    try {
      await axiosInstance.put(`/inventory/update/${inventoryId}`, {
        warehouse_id: warehouseId,
      });
      setPopup({
        isOpen: true,
        title: "Success",
        text: "Item successfully allocated to warehouse store.",
        variant: "success",
      });
      fetchUnassignedItems();
    } catch (err) {
      setPopup({
        isOpen: true,
        title: "Update Failed",
        text: "Unable to update item assignment.",
        variant: "error",
      });
    } finally {
      setIsAssigning(null);
    }
  };

  const warehouseOptions = useMemo(() => {
    const map: Record<string, number> = {};
    const list: string[] = [];

    warehouseRecords.forEach((w) => {
      const isDuplicateName =
        warehouseRecords.filter((x) => x.name === w.name).length > 1;
      let label = w.name;

      if (isDuplicateName) {
        label = `${w.name} (${w.city || "No Location"})`;
        // Second pass check for triple collision
        const isFullyDuplicate =
          warehouseRecords.filter(
            (x) => `${x.name} (${x.city || "No Location"})` === label
          ).length > 1;

        if (isFullyDuplicate) {
          label += ` #${w.warehouse_id}`;
        }
      }

      map[label] = w.warehouse_id;
      list.push(label);
    });

    return { map, list };
  }, [warehouseRecords]);

  useEffect(() => {
    if (!router.isReady || !parsedUserId) return;

    const fetchWarehouses = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/warehouse/user/${encodeURIComponent(parsedUserId)}`
        );
        setWarehouseRecords(response.data.warehouses || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching warehouse data:", error.message);
        } else {
          console.error("Unknown error fetching warehouse data");
        }
        setWarehouseRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [router.isReady, parsedUserId]);

  const filteredWarehouseRecords = useMemo(() => {
    if (!searchQuery) {
      return warehouseRecords;
    }
    return warehouseRecords.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      const addressString = [
        item.address_line_1,
        item.address_line_2,
        item.city,
        item.state,
        item.postal_code,
        item.country,
      ]
        .filter(Boolean)
        .join(", ")
        .toLowerCase();

      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        addressString.includes(searchTerm) ||
        (item.contact_person &&
          item.contact_person.toLowerCase().includes(searchTerm)) ||
        (item.phone && item.phone.toLowerCase().includes(searchTerm)) ||
        (item.storage_capacity &&
          String(item.storage_capacity).toLowerCase().includes(searchTerm))
      );
    });
  }, [warehouseRecords, searchQuery]);

  const tableData = useMemo(() => {
    return {
      columns: [
        "#",
        "Name",
        "Type",
        "Address",
        "Contact Person",
        "Phone",
        "Storage Capacity",
      ],
      rows: filteredWarehouseRecords.map((item) => [
        item.warehouse_id,
        item.name,
        item.type,
        [
          item.address_line_1,
          item.address_line_2,
          item.city,
          item.state,
          item.postal_code,
          item.country,
        ]
          .filter(Boolean)
          .join(", "),
        item.contact_person || "N/A",
        item.phone || "N/A",
        item.storage_capacity != null ? String(item.storage_capacity) : "N/A",
      ]),
    };
  }, [filteredWarehouseRecords]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Storage</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center dark:bg-dark relative mb-4">
          <div>
            <h1 className="text-lg font-semibold">
              Your Warehouses
            </h1>
            <p className="text-xs text-dark dark:text-light">
              {loading
                ? "Loading records..."
                : `${filteredWarehouseRecords.length} Record(s) found ${
                    searchQuery ? "(filtered)" : ""
                  }`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              label="Add Warehouse"
              variant="primary"
              icon={{ left: "add" }}
              onClick={() => setIsSidebarOpen(true)}
            />
          </div>
        </div>
 
        {isAllowedUser && unassignedItems.length > 0 && (
          <div className="mb-8 p-6 bg-gray-400/20 dark:bg-gray-800 rounded-2xl border border-gray-400 dark:border-gray-800 relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div>
                <h2 className="text-base font-bold text-dark dark:text-light flex items-center gap-2">
                  Unallocated Inventory
                </h2>
                <p className="text-xs text-dark/70 dark:text-light/60">Select a warehouse to store your newly purchased or produced items.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
              {unassignedItems.map((item) => (
                <div key={item.inventory_id} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-400 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col group">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-sm text-dark dark:text-light">
                        {item.item_name}
                      </h3>
                      <Badge label={`${item.quantity} ${item.units}`} type="success" size="sm" className="whitespace-nowrap font-semibold" />
                    </div>

                    <div className="mt-auto space-y-3 pt-3 border-t border-gray-400 dark:border-gray-600">
                      <Dropdown
                        placeholder="Select Warehouse..."
                        variant="small"
                        width="full"
                        items={warehouseOptions.list}
                        selectedItem={pendingSelections[item.inventory_id] || ""}
                        onSelect={(val) => setPendingSelections(prev => ({ ...prev, [item.inventory_id]: val }))}
                      />
                      <Button
                        label={isAssigning === item.inventory_id ? "Processing..." : "Store Item"}
                        variant="primary"
                        size="sm"
                        className="w-full font-semibold shadow-sm"
                        icon={{ left: isAssigning === item.inventory_id ? "hourglass_empty" : "move_to_inbox" }}
                        disabled={isAssigning !== null}
                        onClick={() => handleAssignWarehouse(item.inventory_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Table
          data={tableData}
          filteredRows={tableData.rows}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          paginationItems={PAGINATION_ITEMS}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalRecordCount={filteredWarehouseRecords.length}
          onRowClick={(row) => {
            const warehouseId = row[0] as number;
            const warehouseName = row[1] as string;
            if (parsedUserId && warehouseId) {
              router.push({
                pathname: `/${parsedUserId}/warehouse/${warehouseId}`,
                query: { warehouseName: encodeURIComponent(warehouseName) },
              });
            }
          }}
          view={view}
          loading={loading}
          onDeleteRows={handleDeleteRows}
        />

        {isSidebarOpen && (
          <WarehouseForm
            onClose={() => setIsSidebarOpen(false)}
            formTitle="Add New Warehouse"
          />
        )}
      </div>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev: any) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
    </PlatformLayout>
  );
};

export default WarehousePage;

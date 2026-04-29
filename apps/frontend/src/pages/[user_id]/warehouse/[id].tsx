import { InfoModal, Icon, Button, Table } from "@graminate/ui";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import Head from "next/head";
import { useTableActions } from "@/hooks/useTableActions";
import { PAGINATION_ITEMS } from "@/constants/options";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import InventoryForm from "@/components/form/InventoryForm";
import WarehouseForm from "@/components/form/WarehouseForm";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ItemRecord = {
  inventory_id: number;
  user_id: number;
  item_name: string;
  item_group: string;
  units: string;
  quantity: number;
  created_at: string;
  price_per_unit: number;
  warehouse_id: number | null;
  minimum_limit?: number;
  status?: string;
};

type WarehouseDetails = {
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
  category?: string | null;
};

const getBarColor = (quantity: number, max: number) => {
  if (max === 0 && quantity === 0) return "#6B7280";
  if (max === 0 && quantity > 0) return "#04ad79";
  const ratio = quantity / max;
  if (ratio < 0.25) return "#e53e3e";
  if (ratio < 0.5) return "orange";
  if (ratio < 0.75) return "#facd1d";
  return "#04ad79";
};

const generateColors = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`
  );

const Warehouse = () => {
  const router = useRouter();
  const {
    user_id: queryUserId,
    id: queryId,
    warehouseName: queryWarehouseName,
  } = router.query;

  const parsedUserId = Array.isArray(queryUserId)
    ? queryUserId[0]
    : queryUserId;
  const parsedId = Array.isArray(queryId) ? queryId[0] : queryId;

  const warehouseNameFromQuery = queryWarehouseName
    ? decodeURIComponent(
        Array.isArray(queryWarehouseName)
          ? queryWarehouseName[0]
          : queryWarehouseName
      )
    : "Warehouse";

  const [inventoryForWarehouse, setInventoryForWarehouse] = useState<
    ItemRecord[]
  >([]);
  const [currentWarehouseDetails, setCurrentWarehouseDetails] =
    useState<WarehouseDetails | null>(null);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);
  const [isWarehouseFormOpen, setIsWarehouseFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [infoModal, setInfoModal] = useState<{
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
  const { handleDeleteRows } = useTableActions("inventory", setInfoModal);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const { darkMode } = useUserPreferences();

  const [chartThemeColors, setChartThemeColors] = useState({
    textColor: "#333",
    gridColor: "#DDD",
  });

  useEffect(() => {
    setChartThemeColors({
      textColor: darkMode ? "#CCC" : "#333",
      gridColor: darkMode ? "#444" : "#DDD",
    });
  }, [darkMode]);

  const fetchWarehouseData = useCallback(async () => {
    if (!parsedUserId || !parsedId) {
      setLoadingInventory(false);
      return;
    }
    setLoadingInventory(true);
    try {
      const [inventoryResponse, warehouseDetailsResponse] = await Promise.all([
        axiosInstance.get(`/inventory/${parsedUserId}`, {
          params: { warehouse_id: parsedId },
        }),
        axiosInstance.get(`/warehouse/user/${parsedUserId}`),
      ]);

      setInventoryForWarehouse(inventoryResponse.data.items || []);

      const warehouses = warehouseDetailsResponse.data.warehouses || [];
      const foundWarehouse = warehouses.find(
        (wh: WarehouseDetails) =>
          wh.warehouse_id === parseInt(parsedId as string, 10)
      );
      setCurrentWarehouseDetails(foundWarehouse || null);
    } catch (error) {
      console.error("Error fetching warehouse-specific data:", error);
      setInventoryForWarehouse([]);
      setCurrentWarehouseDetails(null);
    } finally {
      setLoadingInventory(false);
    }
  }, [parsedUserId, parsedId, setLoadingInventory]);

  useEffect(() => {
    if (router.isReady) {
      fetchWarehouseData();
    }
  }, [router.isReady, fetchWarehouseData]);

  const searchedInventory = useMemo(() => {
    if (!searchQuery) {
      return inventoryForWarehouse;
    }
    return inventoryForWarehouse.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryForWarehouse, searchQuery]);

  const tableData = useMemo(() => {
    return {
      columns: [
        "#",
        "Commodity",
        "Category",
        "Units",
        "Quantity",
        "Min. Limit",
        "Price / Unit (₹)",
        "Status",
      ],
      rows: searchedInventory.map((item) => [
        item.inventory_id,
        item.item_name,
        item.item_group,
        item.units,
        item.quantity,
        item.minimum_limit != null && item.minimum_limit > 0
          ? item.minimum_limit
          : "N/A",
        item.price_per_unit,
        item.status || "",
      ]),
    };
  }, [searchedInventory]);

  const maxQuantity = Math.max(
    0,
    ...inventoryForWarehouse.map((item) => item.quantity)
  );
  const groups = Array.from(
    new Set(inventoryForWarehouse.map((item) => item.item_group))
  );
  const pieColors = useMemo(
    () => generateColors(inventoryForWarehouse.length),
    [inventoryForWarehouse.length]
  );

  const chartData = useMemo(
    () => ({
      labels: groups,
      datasets: inventoryForWarehouse.map((item, idx) => ({
        label: item.item_name,
        data: groups.map((group) =>
          group === item.item_group ? item.quantity : null
        ),
        backgroundColor: pieColors[idx],
        borderRadius: 4,
      })),
    }),
    [groups, inventoryForWarehouse, pieColors]
  );

  const dynamicWarehouseName =
    currentWarehouseDetails?.name || warehouseNameFromQuery;

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Item Quantities in ${dynamicWarehouseName} by Category`,
          color: chartThemeColors.textColor,
        },
      },
      scales: {
        x: {
          stacked: false,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
          ticks: { color: chartThemeColors.textColor },
          grid: { color: chartThemeColors.gridColor },
        },
        y: {
          stacked: false,
          ticks: { color: chartThemeColors.textColor },
          grid: { color: chartThemeColors.gridColor },
        },
      },
    }),
    [dynamicWarehouseName, chartThemeColors]
  );

  const totalAssetValue = inventoryForWarehouse.reduce(
    (acc, item) =>
      acc + Number(item.price_per_unit || 0) * (item.quantity || 0),
    0
  );

  const cumulativeAddress = useMemo(() => {
    if (!currentWarehouseDetails) return "";
    const placeholders = ["Unassigned", "N/A", "Not Assigned", "No address provided"];
    return [
      currentWarehouseDetails.address_line_1,
      currentWarehouseDetails.address_line_2,
      currentWarehouseDetails.city,
      currentWarehouseDetails.state,
      currentWarehouseDetails.postal_code,
      currentWarehouseDetails.country,
    ]
      .filter(val => val && !placeholders.includes(val))
      .join(", ");
  }, [currentWarehouseDetails]);

  const lowStockItems = useMemo(() => {
    return inventoryForWarehouse.filter(
      (item) =>
        item.minimum_limit != null &&
        item.minimum_limit > 0 &&
        item.quantity < item.minimum_limit
    );
  }, [inventoryForWarehouse]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | {dynamicWarehouseName} - Inventory</title>
      </Head>

      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8">
        {/* Breadcrumbs & Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <nav className="flex items-center gap-2 text-sm text-dark dark:text-light mb-4">
            <button 
              onClick={() => router.push(`/${parsedUserId}`)}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            <Icon type="chevron_right" className="w-4 h-4" />
            <button 
              onClick={() => router.push(`/${parsedUserId}/storage`)}
              className="hover:text-blue-600 transition-colors"
            >
              Storage
            </button>
            <Icon type="chevron_right" className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{dynamicWarehouseName}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {dynamicWarehouseName}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-dark dark:text-light">
                  <span className="flex items-center gap-1">
                    <Icon type="warehouse" />
                    {currentWarehouseDetails?.category || "General"} Storage
                  </span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span className="flex items-center gap-1">
                    <Icon type="location_on" className="w-4 h-4" />
                    {currentWarehouseDetails?.city}, {currentWarehouseDetails?.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                icon={{ left: "edit" }}
                label="Edit Warehouse"
                variant="secondary"
                onClick={() => setIsWarehouseFormOpen(true)}
                className="!rounded-xl"
              />
              <Button
                icon={{ left: "add" }}
                label="Add New Item"
                variant="primary"
                onClick={() => setIsInventoryFormOpen(true)}
                className="!rounded-xl shadow-lg shadow-blue-600/20"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: "Total Items", 
                value: inventoryForWarehouse.length, 
                icon: "inventory", 
                color: "blue",
                sub: "In storage" 
              },
              { 
                label: "Asset Value", 
                value: `₹${totalAssetValue.toLocaleString("en-IN")}`, 
                icon: "payments", 
                color: "green",
                sub: "Estimated total" 
              },
              { 
                label: "Low Stock", 
                value: lowStockItems.length, 
                icon: "warning", 
                color: lowStockItems.length > 0 ? "red" : "blue",
                sub: "Need attention" 
              },
              { 
                label: "Capacity", 
                value: `${currentWarehouseDetails?.storage_capacity || "N/A"}`, 
                icon: "view_quilt", 
                color: "orange",
                sub: "sq. ft. area" 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-400 dark:border-gray-700 group hover:border-green-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-dark dark:text-light uppercase tracking-wider">{stat.label}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-dark dark:text-light mb-1">{stat.value}</h3>
                  <p className="text-xs text-dark dark:text-light flex items-center gap-1">
                    {stat.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Insights */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stock Distribution</h3>
                    <p className="text-sm text-dark dark:text-light">Inventory levels across categories</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Bar data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Inventory Table Container */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-400 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-dark dark:text-light">Detailed Inventory</h3>
                  <div className="relative w-full sm:w-64">
                    <Icon type="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark dark:text-light" />
                    <input 
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:border-green-200 outline-none transition-all"
                    />
                  </div>
                </div>
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
                  totalRecordCount={inventoryForWarehouse.length}
                  onRowClick={(row) => {
                    const inventoryId = row[0] as number;
                    const item = inventoryForWarehouse.find(
                      (i) => i.inventory_id === inventoryId
                    );
                    if (item) {
                      setEditingItem(item);
                      setIsInventoryFormOpen(true);
                    }
                  }}
                  view="inventory"
                  loading={loadingInventory}
                  onDeleteRows={handleDeleteRows}
                />
              </div>
            </div>

            {/* Sidebar Details & Alerts */}
            <div className="space-y-8">
              {/* Asset Share Pie */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-400 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">Quantity Share</h3>
                <div className="max-w-[220px] mx-auto">
                  <Pie
                    data={{
                      labels: inventoryForWarehouse.length > 0 
                        ? inventoryForWarehouse.map((item) => item.item_name) 
                        : ["No Items"],
                      datasets: [{
                        data: inventoryForWarehouse.length > 0 
                          ? inventoryForWarehouse.map((item) => item.quantity) 
                          : [1],
                        backgroundColor: inventoryForWarehouse.length > 0 
                          ? pieColors 
                          : ["#e5e7eb"], // gray-200 for empty state
                        borderWidth: 0,
                        hoverOffset: 4
                      }],
                    }}
                    options={{
                      plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: inventoryForWarehouse.length > 0 }
                      },
                      maintainAspectRatio: true,
                      cutout: "65%" // Making it a donut for a more modern look
                    }}
                  />
                </div>
                {inventoryForWarehouse.length === 0 && (
                  <div className="mt-8 text-center py-4 border-t border-gray-400/20 dark:border-gray-700/50">
                    <p className="text-sm font-bold text-dark dark:text-light">Inventory Empty</p>
                    <p className="text-xs text-dark dark:text-light opacity-60">Start adding items to see distribution</p>
                  </div>
                )}
              </div>

              {/* Alerts Card */}
              {lowStockItems.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                    <Icon type="warning" className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Critical Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.inventory_id} className="bg-white dark:bg-gray-800/50 p-3 rounded-2xl shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.item_name}</p>
                          <p className="text-[10px] text-red-500">Low Stock: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-dark dark:text-light uppercase">Min</p>
                          <p className="text-xs font-bold text-dark dark:text-light">{item.minimum_limit}</p>
                        </div>
                      </div>
                    ))}
                    {lowStockItems.length > 3 && (
                      <p className="text-[10px] text-center text-red-400">
                        {lowStockItems.length - 3} more alerts available
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Warehouse Details Card */}
              <div className="bg-white dark:bg-gray-700 rounded-3xl p-6 text-dark dark:text-light border-1 shadow-sm border-gray-400 dark:border-gray-700 relative overflow-hidden group">
                <h3 className="text-lg font-bold mb-4 relative z-10">Facility Info</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Icon type="person" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-200 uppercase tracking-wider">Manager</p>
                      <p className="text-sm font-medium">
                        {currentWarehouseDetails?.contact_person && 
                        !["Unassigned", "N/A", "Not Assigned"].includes(currentWarehouseDetails.contact_person) ? (
                          currentWarehouseDetails.contact_person
                        ) : (
                          <Button
                            label="Assign"
                            variant="link"
                            size="sm"
                            onClick={() => setIsWarehouseFormOpen(true)}
                          />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Icon type="call" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-200 uppercase tracking-wider">Contact</p>
                      <p className="text-sm font-medium">
                        {currentWarehouseDetails?.phone && 
                        !["Unassigned", "N/A", "Not Assigned"].includes(currentWarehouseDetails.phone) ? (
                          currentWarehouseDetails.phone
                        ) : (
                          <Button
                            label="Assign"
                            variant="link"
                            size="sm"
                            onClick={() => setIsWarehouseFormOpen(true)}
                          />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Icon type="location_on" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-200 uppercase tracking-wider">Address</p>
                      <p className="text-sm font-medium leading-relaxed">
                        {cumulativeAddress ? (
                          cumulativeAddress
                        ) : (
                          <Button
                            label="Assign"
                            variant="link"
                            size="sm"
                            onClick={() => setIsWarehouseFormOpen(true)}
                          />
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        {isInventoryFormOpen && parsedId && (
          <InventoryForm
            onClose={() => {
              setIsInventoryFormOpen(false);
              setEditingItem(null);
            }}
            formTitle={
              editingItem
                ? `Edit ${editingItem.item_name}`
                : `Add Item to ${dynamicWarehouseName}`
            }
            warehouseId={parseInt(String(parsedId), 10)}
            initialData={editingItem || undefined}
            onSuccess={() => {
              setIsInventoryFormOpen(false);
              setEditingItem(null);
              fetchWarehouseData();
            }}
          />
        )}
        {isWarehouseFormOpen && parsedId && currentWarehouseDetails && (
          <WarehouseForm
            onClose={() => setIsWarehouseFormOpen(false)}
            formTitle={`Edit ${currentWarehouseDetails.name}`}
            warehouseId={parseInt(String(parsedId), 10)}
            initialData={{
              name: currentWarehouseDetails.name,
              type: currentWarehouseDetails.type,
              address_line_1: currentWarehouseDetails.address_line_1 || "",
              address_line_2: currentWarehouseDetails.address_line_2 || "",
              city: currentWarehouseDetails.city || "",
              state: currentWarehouseDetails.state || "",
              postal_code: currentWarehouseDetails.postal_code || "",
              country: currentWarehouseDetails.country || "",
              contact_person: currentWarehouseDetails.contact_person || "",
              phone: currentWarehouseDetails.phone || "",
              storage_capacity:
                currentWarehouseDetails.storage_capacity?.toString() || "",
              category: currentWarehouseDetails.category || "",
            }}
            onSuccess={() => {
              setIsWarehouseFormOpen(false);
              fetchWarehouseData();
            }}
          />
        )}
        <InfoModal
          isOpen={infoModal.isOpen}
          onClose={() => setInfoModal((prev: any) => ({ ...prev, isOpen: false }))}
          title={infoModal.title}
          text={infoModal.text}
          variant={infoModal.variant}
        />
      </div>
    </PlatformLayout>
  );
};

export default Warehouse;

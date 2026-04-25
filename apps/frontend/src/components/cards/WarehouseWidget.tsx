import { Icon } from "@graminate/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "../ui/Loader";

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
  category?: string | null;
  items?: ItemRecord[];
};

type ItemRecord = {
  inventory_id: number;
  item_name: string;
  quantity: number;
  units: string;
  warehouse_id: number | null;
};

interface WarehouseWidgetProps {
  serviceName: string;
}

const WarehouseWidget = ({ serviceName }: WarehouseWidgetProps) => {
  const router = useRouter();
  const { user_id } = router.query;
  const parsedUserId = Array.isArray(user_id) ? user_id[0] : user_id;

  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parsedUserId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [warehouseRes, inventoryRes] = await Promise.all([
          axiosInstance.get(`/warehouse/user/${encodeURIComponent(parsedUserId)}`),
          axiosInstance.get(`/inventory/${encodeURIComponent(parsedUserId)}`, {
            params: { item_group: serviceName }
          })
        ]);

        const allWarehouses: WarehouseRecord[] = warehouseRes.data.warehouses || [];
        const allItems: ItemRecord[] = inventoryRes.data.items || [];

        // Filter warehouses that match the service name
        const filteredWarehouses = allWarehouses.filter(w => 
          w.category === serviceName || 
          w.name.toLowerCase().includes(serviceName.toLowerCase())
        );

        // Map items to warehouses
        const warehousesWithItems = filteredWarehouses.map(w => ({
          ...w,
          items: allItems.filter(item => item.warehouse_id === w.warehouse_id)
        }));

        setWarehouses(warehousesWithItems);
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parsedUserId, serviceName]);

  if (loading) return <div className="flex justify-center p-4"><Loader /></div>;
  if (warehouses.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-400 dark:border-gray-700 p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Associated Warehouse(s)
            </h3>
            <p className="text-xs text-dark dark:text-light">
              Warehouse management for {serviceName}
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/${parsedUserId}/storage`)}
          className="text-sm cursor-pointer font-medium text-blue-200 dark:text-blue-400 flex items-center gap-1"
        >
          View All <Icon type="chevron_right" />
        </button>
      </div>

      <div className={`space-y-4 ${warehouses.length > 2 ? 'max-h-[280px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
        {warehouses.map((warehouse) => (
          <div 
            key={warehouse.warehouse_id}
            onClick={() => router.push(`/${parsedUserId}/warehouse/${warehouse.warehouse_id}`)}
            className="group cursor-pointer p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {warehouse.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-dark dark:text-light">
                  <Icon type="location_on" className="w-3 h-3" />
                  <span>{warehouse.city}, {warehouse.state}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-[10px] font-bold bg-blue-400 dark:bg-blue-900/50 text-blue-100 dark:text-blue-300 rounded-lg uppercase tracking-wider">
                  {warehouse.type.split(' ')[0]}
                </span>
                <p className="text-[10px] text-dark dark:text-light mt-1 uppercase">Capacity</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {warehouse.storage_capacity || 'N/A'} units
                </p>
              </div>
            </div>

            {warehouse.items && warehouse.items.length > 0 ? (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Icon type="inventory" className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-dark dark:text-light">
                    Stock Summary ({warehouse.items.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {warehouse.items.slice(0, 2).map((item) => (
                    <div key={item.inventory_id} className="flex justify-between items-center bg-white dark:bg-gray-800/50 p-2 rounded-lg border border-gray-400 dark:border-gray-700">
                      <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate max-w-[60px]">
                        {item.item_name}
                      </span>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white">
                        {item.quantity} {item.units.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                  {warehouse.items.length > 2 && (
                    <div className="col-span-2 text-center">
                      <p className="text-[9px] text-blue-500 font-medium">
                        + {warehouse.items.length - 2} more items
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-gray-400 dark:border-gray-700 text-center">
                <p className="text-[10px] text-dark dark:text-light">Warehouse empty</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarehouseWidget;

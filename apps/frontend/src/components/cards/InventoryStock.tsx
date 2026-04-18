import { Icon } from "@graminate/ui";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/utils/axiosInstance";
import Loader from "../ui/Loader";

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

type InventoryStockProps = {
  userId: string | undefined;
  title: string;
  category: string;
};

const InventoryStockCard = ({
  userId,
  title,
  category,
}: InventoryStockProps) => {
  const [inventoryItems, setInventoryItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !category) {
      setLoading(false);
      setInventoryItems([]);
      if (!category) {
        setError("Category not specified.");
      }
      if (!userId) {
        setError("User ID not specified.");
      }
      return;
    }

    const fetchInventoryItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/inventory/${userId}`, {
          params: { item_group: category },
        });
        setInventoryItems(response.data.items || []);
      } catch (error) {
        console.error(`Failed to fetch ${category} inventory:`, error);
        setError(`Failed to load ${category.toLowerCase()} inventory data.`);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryItems();
  }, [userId, category]);

  const getItemStatus = (
    item: ItemRecord
  ): { text: string; className: string } => {
    const { quantity, minimum_limit } = item;

    if (quantity === 0) {
      return { text: "Unavailable", className: "bg-red-400 text-white" };
    }

    const effectiveMinLimit = minimum_limit ?? 0;

    if (effectiveMinLimit > 0 && quantity < effectiveMinLimit) {
      return { text: "Limited", className: "bg-orange-300 text-white" };
    }
    return { text: "Available", className: "bg-green-200 text-white" };
  };

  return (
    <div className="dark:bg-gray-800 shadow-md rounded-lg p-6 h-80 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>
      {loading && (
        <div className="flex-grow flex items-center justify-center">
          <Loader />
        </div>
      )}
      {error && (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          {inventoryItems.length > 0 ? (
            <div className="flex-grow overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 custom-scrollbar bg-inherit">
                <table className="w-full text-sm border-separate border-spacing-y-2 bg-inherit">
                  <thead className="sticky top-0 z-10 bg-inherit">
                    <tr className="text-gray-300 text-xs uppercase bg-gray-400 dark:bg-gray-800 tracking-wider bg-inherit">
                      <th className="font-medium pb-2 text-left bg-inherit">Item Name</th>
                      <th className="font-medium pb-2 text-center w-24 bg-inherit">Stock</th>
                      <th className="font-medium pb-2 text-center w-24 bg-inherit">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {inventoryItems.map((item) => {
                      const statusInfo = getItemStatus(item);
                      return (
                        <tr
                          key={item.inventory_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="py-2 align-middle">
                            <span className="text-dark dark:text-light truncate block max-w-[120px] sm:max-w-none">
                              {item.item_name}
                            </span>
                          </td>
                          <td className="py-2 px-2 align-middle text-center font-medium whitespace-nowrap">
                            {item.quantity} {item.units}
                          </td>
                          <td className="py-2 align-middle text-center">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block min-w-[75px] ${statusInfo.className}`}
                            >
                              {statusInfo.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center flex-grow py-4">
              <Icon
                type={"inventory"}
                className="w-12 h-12 text-gray-300 mb-3"
              />
              <p className="text-gray-300">
                No {category.toLowerCase()} items found in inventory.
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Add items with category &quot;{category}&quot; via Warehouse
                Inventory to see them here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryStockCard;

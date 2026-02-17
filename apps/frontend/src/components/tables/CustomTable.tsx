import Button from "@/components/ui/Button";
import TextField from "../ui/TextField";

type Item = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type CustomTableProps = {
  items: Item[];
  onItemsChange: (newItems: Item[]) => void;
  loading?: boolean;
};

const CustomTable = ({ items, onItemsChange, loading }: CustomTableProps) => {
  const addItem = () => {
    const newItems = [
      ...items,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ];
    onItemsChange(newItems);
  };

  const updateItem = (
    index: number,
    key: keyof Item,
    value: string | number
  ) => {
    const updatedItems = [...items];
    const currentItem = updatedItems[index];

    let newQuantity = currentItem.quantity;
    let newRate = currentItem.rate;

    if (key === "quantity") {
      newQuantity = Number(value) || 0;
    } else if (key === "rate") {
      newRate = Number(value) || 0;
    }

    updatedItems[index] = {
      ...currentItem,
      [key]: value,
      amount: newQuantity * newRate,
    };
    onItemsChange(updatedItems);
  };

  return (
    <div className="mt-6">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-light">
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">
                Item Description
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium whitespace-nowrap">
                Quantity
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium">
                Rate (₹)
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <tr
                    key={`skeleton-row-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[200px] sm:min-w-[250px]">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center min-w-[80px] sm:min-w-[100px]">
                      <div className="h-6 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center min-w-[100px] sm:min-w-[120px]">
                      <div className="h-6 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-right min-w-[100px] sm:min-w-[120px]">
                      <div className="h-6 w-20 ml-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              : items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[200px] sm:min-w-[250px]">
                      <TextField
                        value={item.description}
                        onChange={(val) =>
                          updateItem(index, "description", val)
                        }
                        placeholder="Item or service"
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center min-w-[80px] sm:min-w-[100px]">
                      <TextField
                        value={item.quantity.toString()}
                        onChange={(val) =>
                          updateItem(index, "quantity", parseFloat(val) || 0)
                        }
                        number={true}
                        width="small"
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center min-w-[100px] sm:min-w-[120px]">
                      <TextField
                        value={item.rate.toString()}
                        onChange={(val) =>
                          updateItem(index, "rate", parseFloat(val) || 0)
                        }
                        number={true}
                        width="small"
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-right dark:text-light min-w-[100px] sm:min-w-[120px] whitespace-nowrap">
                      ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="pt-4">
          <Button text="+ Add Item" style="primary" onClick={addItem} />
        </div>
      )}
    </div>
  );
};

export default CustomTable;

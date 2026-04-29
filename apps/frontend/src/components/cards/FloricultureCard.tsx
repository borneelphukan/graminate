import { Icon } from "@graminate/ui";
import { format } from "date-fns";

import { FloricultureData } from "../form/floriculture/FloricultureForm";

interface FloricultureCardProps {
  data: FloricultureData;
  onClick: (id: number, name: string) => void;
}

const FloricultureCard = ({ data, onClick }: FloricultureCardProps) => {
  return (
    <div 
      onClick={() => data.flower_id && onClick(data.flower_id, data.flower_name)}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-400 dark:border-gray-700 p-5 transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Icon type="local_florist" size="lg" />
        </div>
        <span className="px-2 py-1 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg uppercase tracking-wider">
          {data.flower_type || "Standard"}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {data.flower_name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-4">
          <Icon type="architecture" size="xs" />
          {data.method || "Traditional Method"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-tight">Area</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {data.area ? `${data.area} sq ft` : "N/A"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase font-bold tracking-tight">Planted</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {data.planting_date ? format(new Date(data.planting_date), "MMM d, yyyy") : "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        <span>View Details</span>
        <Icon type="arrow_forward" size="xs" />
      </div>
    </div>
  );
};

export default FloricultureCard;

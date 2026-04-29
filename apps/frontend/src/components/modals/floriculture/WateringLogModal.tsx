import { Icon, Button, Table, Checkbox } from "@graminate/ui";
import React, { useMemo } from "react";
import { format } from "date-fns";

type WateringEvent = {
  watering_id: number;
  flower_id: number;
  user_id: number;
  watering_date: string;
  watered: boolean;
};

type FlowerWithWatering = {
  flower_id: number;
  flower_name: string;
  flower_watering: WateringEvent[];
};

type WateringLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  flowersForDate: FlowerWithWatering[];
  loading: boolean;
  onWaterChange: (flowerId: number, watered: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
};

const WateringLogModal = ({
  isOpen,
  onClose,
  selectedDate,
  flowersForDate,
  loading,
  onWaterChange,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}: WateringLogModalProps) => {
  const tableData = useMemo(() => {
    const filtered = flowersForDate.filter((f) =>
      f.flower_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      columns: ["#", "Flower Name", "Watered"],
      rows: filtered.map((f) => [
        f.flower_id,
        f.flower_name,
        <div key={f.flower_id} className="flex justify-center">
          <Checkbox
            id={`water-check-${f.flower_id}`}
            checked={f.flower_watering.length > 0 && f.flower_watering[0].watered}
            onCheckedChange={(checked) => onWaterChange(f.flower_id, !!checked)}
          />
        </div>,
      ]),
    };
  }, [flowersForDate, searchQuery, onWaterChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-gray-400/20 shadow-2xl bg-white/20 p-1 w-full max-w-5xl mx-4 transition-all duration-300">
        <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-400/20 shadow-sm p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-400 dark:border-gray-600">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Icon type="water_drop" className="text-blue-500" />
              Watering Log - {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </h3>
            <Button
              variant="ghost"
              icon={{ left: "close" }}
              onClick={onClose}
              aria-label="Close modal"
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
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
              totalRecordCount={tableData.rows.length}
              loading={loading}
              hideChecks={true}
              download={false}
              view="watering"
            />
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-400 dark:border-gray-600">
            <Button
              label="Close"
              variant="secondary"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WateringLogModal;

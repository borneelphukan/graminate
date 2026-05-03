import React, { useState, useEffect } from "react";
import { Icon, Button, SearchBar, Checkbox, Popup } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { format } from "date-fns";
import { FloricultureData } from "../form/FloricultureForm";

interface FloricultureExplorerProps {
  records: FloricultureData[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (record: FloricultureData) => void;
  onRefresh: () => void;
}

const FloricultureExplorer = ({ 
  records, 
  searchQuery, 
  onSearchChange, 
  onEdit, 
  onRefresh
}: FloricultureExplorerProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (records.length > 0 && selectedId === null) {
      setSelectedId(records[0].flower_id || null);
    }
  }, [records, selectedId]);

  const selectedRecord = records.find(r => r.flower_id === selectedId) || records[0];

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmDelete(true);
  };

  const confirmDeleteSelected = async () => {
    setDeleting(true);
    try {
      await axiosInstance.post("/floriculture/delete-multiple", {
        ids: Array.from(selectedIds),
      });
      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      console.error("Error deleting records:", error);
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-[600px]">
      {/* Sidebar - List of Items */}
      <div className="w-full md:w-80 border-r border-gray-400 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/20">
        <div className="p-4 border-b border-gray-400 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <Icon type="list" />
              Flower List
            </h3>
          </div>
          
          <SearchBar 
            value={searchQuery}
            placeholder="Search..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Selection Header */}
        <div className="bg-white dark:bg-gray-700 px-4 py-2 border-b border-gray-400 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox 
              id="select-all"
              checked={records.length > 0 && selectedIds.size === records.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedIds(new Set(records.map(r => r.flower_id!)));
                } else {
                  setSelectedIds(new Set());
                }
              }}
            />
            {selectedIds.size > 0 && (
              <span className="text-xs font-bold text-dark dark:text-light animate-in fade-in slide-in-from-left-1 duration-200">
                {selectedIds.size} Selected
              </span>
            )}
          </div>
          {selectedIds.size > 0 && (
            <Button 
              onClick={handleDeleteClick}
              disabled={deleting}
              variant="destructive"
              size="sm"
              label="Delete"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {records.map((record) => (
            <div
              key={record.flower_id}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 relative group/item ${
                selectedId === record.flower_id
                  ? "bg-gray-400 dark:bg-gray-700"
                  : "hover:bg-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex-shrink-0">
                <Checkbox 
                  id={`select-${record.flower_id}`}
                  checked={selectedIds.has(record.flower_id!)}
                  onCheckedChange={() => handleToggleSelect(record.flower_id!)}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setSelectedId(record.flower_id || null)}>
                <div className={`p-2 rounded-lg flex-shrink-0 ${selectedId === record.flower_id ? "bg-green-200 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-500"}`}>
                  <Icon type="local_florist" size="xs" />
                </div>
                <div className="flex-1 truncate">
                  <p className={`text-sm font-bold truncate ${selectedId === record.flower_id ? "text-green-200" : "text-gray-700 dark:text-gray-300"}`}>
                    {record.flower_name}
                  </p>
                  <p className="text-xs text-dark dark:text-light truncate">
                    {record.flower_type || "No Type"} • {record.method || "Field"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-700 overflow-hidden">
        {records.length > 0 && selectedRecord ? (
          <>
            <div className="p-6 md:p-8 border-b border-gray-400 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-bold bg-blue-400 dark:bg-blue-200 text-blue-200 dark:text-blue-400 rounded-lg uppercase tracking-wider">
                    {selectedRecord.flower_type || "Flower Crop"}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {selectedRecord.flower_name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  label="Edit" 
                  variant="secondary"
                  size="sm"
                  icon={{ left: "edit" }}
                  onClick={() => onEdit(selectedRecord)}
                  className="!py-2"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-400 dark:border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                      <Icon type="architecture" />
                    <p className="text-xs font-bold text-dark dark:text-light uppercase">Method</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRecord.method || "Open Field Cultivation"}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-400 dark:border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                      <Icon type="square_foot" size="xs" />
                    <p className="text-xs font-bold text-dark dark:text-light uppercase">Number of Plants</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedRecord.plants ? `${selectedRecord.plants} plants` : "Not Specified"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-400 dark:border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                      <Icon type="event" size="xs" />
                    <p className="text-xs font-bold text-dark dark:text-light uppercase">Planting Date</p>
                  </div>
                  <p className="text-sm text-dark dark:text-light">
                    {selectedRecord.planting_date ? format(new Date(selectedRecord.planting_date), "MMMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-dark dark:text-white flex items-center gap-2">
                  <Icon type="analytics" />
                  <p className="text-sm font-bold text-dark dark:text-white">Crop Health Tracking</p>
                </h4>
                {/* Add Disease Tracking Component here */}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 p-8 text-center">
            <div className="text-gray-400 mb-6 ">
              <Icon type="inventory_2" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {records.length === 0 ? "No flowers found" : "Select a flower"}
            </h3>
            <p className="text-dark dark:text-light">
              {records.length === 0 
                ? "Try adjusting your search or add a new flower record to get started." 
                : "Choose a record from the list on the left to view its full details and analytics."}
            </p>
          </div>
        )}
      </div>

      {showConfirmDelete && (
        <Popup
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          title="Confirm Deletion"
          text={`Are you sure you want to delete ${selectedIds.size} selected flower record${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          showCancelButton={true}
          onConfirm={confirmDeleteSelected}
          variant="error"
        />
      )}
    </div>
  );
};

export default FloricultureExplorer;

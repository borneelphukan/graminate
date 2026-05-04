import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Icon, Button, SearchBar, Checkbox, Popup, IconType } from "@graminate/ui";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { format } from "date-fns";
import { FloricultureData } from "../form/FloricultureForm";

interface FloricultureExplorerProps {
  records: FloricultureData[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (record: FloricultureData) => void;
  onRefresh: () => void;
  selectedFlowerId?: number | null;
  onSelectFlower?: (id: number | null) => void;
}

const FloricultureExplorer = ({ 
  records, 
  searchQuery, 
  onSearchChange, 
  onEdit, 
  onRefresh,
  selectedFlowerId,
  onSelectFlower
}: FloricultureExplorerProps) => {
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(null);
  const selectedId = selectedFlowerId !== undefined ? selectedFlowerId : localSelectedId;
  const setSelectedId = onSelectFlower !== undefined ? onSelectFlower : setLocalSelectedId;
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (records.length > 0 && selectedId === null) {
      setSelectedId(records[0].flower_id || null);
    }
  }, [records, selectedId, setSelectedId]);

  const selectedRecord = records.find(r => r.flower_id === selectedId) || records[0];

  const { plan } = useUserPreferences();
  const isPro = plan === "PRO";

  const [wateredDays, setWateredDays] = useState(0);
  const [scientificName, setScientificName] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [wateringFrequency, setWateringFrequency] = useState<number>(3);

  const [loadingAI, setLoadingAI] = useState(false);

  const fetchAIPlantInfo = useCallback(async (force = false) => {
    if (!isPro || !selectedRecord?.flower_name) {
      setScientificName("");
      setShortDescription("");
      setBestPractices([]);
      return;
    }
    const cacheKey = `ai_plant_info_${selectedRecord.flower_name}`;
    if (!force) {
      const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setScientificName(parsed.scientific_name || "");
          setShortDescription(parsed.short_description || "");
          setBestPractices(parsed.best_practices || []);
          if (typeof parsed.watering_frequency === "number") {
            setWateringFrequency(parsed.watering_frequency);
          }
          return;
        } catch (e) {
          console.error("Error reading cached info:", e);
        }
      }
    }
    setLoadingAI(true);
    try {
      const res = await axiosInstance.post("/llm", {
        history: [
          {
            sender: "user",
            text: `Considering "${selectedRecord.flower_name}", provide its scientific name, a short description, 3 best practices for cultivation, and its ideal watering frequency in days. Respond in valid JSON only with keys: "scientific_name", "short_description", "best_practices" (array of strings), and "watering_frequency" (integer number of days). Do not use any extra text or format outside the JSON.`
          }
        ],
        userId: "anonymous",
        token: typeof window !== "undefined" ? localStorage.getItem("token") || "test_token" : "test_token"
      });
      let parsed: any = null;
      if (res.data?.answer) {
        const match = res.data.answer.match(/\{[\s\S]*?\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (e) {
            console.error("JSON parse error on matched regex", e);
          }
        }
      }
      if (parsed) {
        if (parsed.scientific_name) setScientificName(parsed.scientific_name);
        if (parsed.short_description) setShortDescription(parsed.short_description);
        if (Array.isArray(parsed.best_practices)) setBestPractices(parsed.best_practices);
        if (typeof parsed.watering_frequency === "number") {
          setWateringFrequency(parsed.watering_frequency);
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        }
      } else {
        const fallback = {
          scientific_name: `${selectedRecord.flower_name} spp.`,
          short_description: `A popular floriculture crop prized for its aesthetic appeal, vibrant colors, and suitability for local cultivation.`,
          best_practices: [
            "Ensure regular watering while maintaining proper drainage to prevent root rot.",
            "Place in a location with adequate daily sunlight suitable for blooming.",
            "Use well-aerated soil mix rich in organic nutrients for ideal plant growth."
          ],
          watering_frequency: 3
        };
        setScientificName(fallback.scientific_name);
        setShortDescription(fallback.short_description);
        setBestPractices(fallback.best_practices);
        setWateringFrequency(fallback.watering_frequency);
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(fallback));
        }
      }
    } catch (err) {
      console.error("Error fetching AI plant info:", err);
      const fallback = {
        scientific_name: `${selectedRecord.flower_name} spp.`,
        short_description: `A popular floriculture crop prized for its aesthetic appeal, vibrant colors, and suitability for local cultivation.`,
        best_practices: [
          "Ensure regular watering while maintaining proper drainage to prevent root rot.",
          "Place in a location with adequate daily sunlight suitable for blooming.",
          "Use well-aerated soil mix rich in organic nutrients for ideal plant growth."
        ]
      };
      setScientificName(fallback.scientific_name);
      setShortDescription(fallback.short_description);
      setBestPractices(fallback.best_practices);
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      }
    } finally {
      setLoadingAI(false);
    }
  }, [selectedRecord, isPro]);

  useEffect(() => {
    fetchAIPlantInfo(false);
  }, [fetchAIPlantInfo]);

  const [wateringEvents, setWateringEvents] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setWateredDays(0);
    const fetchWateringStats = async () => {
      if (!selectedRecord?.flower_id || !selectedRecord?.user_id) return;
      try {
        const response = await axiosInstance.get(`/floriculture/watering/${selectedRecord.user_id}`);
        const events = response.data || [];
        if (isMounted) {
          setWateringEvents(events);
          const filtered = events.filter((e: any) => 
            Boolean(e.watered) === true && 
            Number(e.flower_id) === Number(selectedRecord.flower_id)
          );
          const uniqueDates = new Set(
            filtered
              .filter((e: any) => e.watering_date)
              .map((e: any) => e.watering_date.split("T")[0])
          );
          setWateredDays(uniqueDates.size);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchWateringStats();
    return () => { isMounted = false; };
  }, [selectedRecord]);

  const totalDays = useMemo(() => {
    const dates = new Set<string>();
    if (isPro && selectedRecord?.planting_date) {
      const pDate = new Date(selectedRecord.planting_date);
      if (!isNaN(pDate.getTime())) {
        for (let i = 0; i < 365; i += wateringFrequency) {
          const wDate = new Date(pDate);
          wDate.setDate(pDate.getDate() + i);
          dates.add(format(wDate, "yyyy-MM-dd"));
        }
      }
    }
    wateringEvents.forEach((e: any) => {
      if (e.flower_id === selectedRecord.flower_id && e.watering_date) {
        dates.add(e.watering_date.split("T")[0]);
      }
    });
    return dates.size;
  }, [isPro, selectedRecord, wateringFrequency, wateringEvents]);

  const daysSincePlanted = useMemo(() => {
    if (!selectedRecord?.planting_date) return 0;
    const pDate = new Date(selectedRecord.planting_date);
    if (isNaN(pDate.getTime())) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pDate.setHours(0, 0, 0, 0);
    const diff = today.getTime() - pDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [selectedRecord]);

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
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-400 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-auto min-h-[650px]">
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 max-h-[500px] md:max-h-none">
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
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-700 overflow-hidden h-auto md:max-h-[650px]">
        {records.length > 0 && selectedRecord ? (
          <>
            <div className="p-6 md:p-8 border-b border-gray-400 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-bold bg-blue-400 dark:bg-blue-200 text-blue-200 dark:text-blue-400 rounded-lg uppercase tracking-wider">
                    {selectedRecord.flower_type || "Flower Crop"}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-dark dark:text-light tracking-tight">
                  {selectedRecord.flower_name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-dark dark:text-light">
                  <div className="flex items-center gap-1.5">
                    <Icon type="architecture" />
                    <span className="font-medium text-dark dark:text-light">
                      {selectedRecord.method || "Open Field Cultivation"}
                    </span>
                  </div>
                  <div className="w-px h-3.5 bg-gray-400 dark:bg-gray-600 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <Icon type="square_foot" size="xs" />
                    <span className="font-medium text-dark dark:text-light">
                      {selectedRecord.plants ? `${selectedRecord.plants} plants` : "Not Specified"}
                    </span>
                  </div>
                  <div className="w-px h-3.5 bg-gray-400 dark:bg-gray-600 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <Icon type="event" size="xs"/>
                    <span className="font-medium text-dark dark:text-light">
                      {selectedRecord.planting_date ? format(new Date(selectedRecord.planting_date), "MMMM d, yyyy") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  label="Edit" 
                  variant="secondary"
                  icon={{ left: "edit" }}
                  onClick={() => onEdit(selectedRecord)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-light dark:bg-gray-600 p-4 rounded-xl flex flex-col gap-1 border border-gray-400 dark:border-gray-600">
                  <span className="text-xs font-bold text-dark dark:text-light uppercase">Watering Progress</span>
                  <span className="text-2xl font-black text-dark dark:text-light">{wateredDays} / {totalDays} days</span>
                </div>
                <div className="bg-light dark:bg-gray-600 p-4 rounded-xl flex flex-col gap-1 border border-gray-400 dark:border-gray-600">
                  <span className="text-xs font-bold text-dark dark:text-light">Days Since Planted</span>
                  <span className="text-2xl font-black text-dark dark:text-light">{daysSincePlanted} days</span>
                </div>
              </div>

              {isPro && (
                <div className="bg-light dark:bg-gray-600 p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in duration-500 border border-gray-400 dark:border-gray-600">
                  <div className="flex items-center justify-between border-b border-gray-400 dark:border-gray-600 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon type="psychology" className="text-dark dark:text-light" />
                      <span className="text-sm font-bold text-dark dark:text-light">
                        AI Insights & Cultivation Guide
                      </span>
                    </div>
                    <Button
                      onClick={() => fetchAIPlantInfo(true)}
                      disabled={loadingAI}
                      variant="ghost"
                      icon={{ left: "auto_awesome" as IconType }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {scientificName && (
                      <div>
                        <span className="text-xs font-bold text-dark dark:text-light uppercase">Scientific Name</span>
                        <p className="text-sm font-semibold italic text-dark dark:text-light mt-0.5">{scientificName}</p>
                      </div>
                    )}
                    {shortDescription && (
                      <div>
                        <span className="text-xs font-bold text-dark dark:text-light uppercase">Plant Description</span>
                        <p className="text-sm text-dark dark:text-light mt-0.5">{shortDescription}</p>
                      </div>
                    )}
                    {bestPractices.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-dark dark:text-light uppercase">Best Practices</span>
                        <ul className="list-disc list-inside mt-1 text-sm text-dark dark:text-light space-y-1">
                          {bestPractices.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 p-8 text-center">
              <Icon type="inventory_2" size="lg" />
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

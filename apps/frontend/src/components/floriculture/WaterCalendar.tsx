import React, { useState, useEffect, useCallback, useMemo } from "react";
import CalendarHeader from "../ui/Calendar/CalendarHeader";
import axiosInstance from "@/lib/utils/axiosInstance";
import { Checkbox, Icon, SearchBar, Button } from "@graminate/ui";
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

const WaterCalendar = ({ userId, selectedFlowerId, selectedFlowerName }: { userId: string | number; selectedFlowerId?: number | null; selectedFlowerName?: string }) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [wateringEvents, setWateringEvents] = useState<Record<string, boolean>>({});
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [flowersForDate, setFlowersForDate] = useState<FlowerWithWatering[]>([]);
  const [loadingFlowers, setLoadingFlowers] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchWateringEvents = useCallback(async () => {
    if (!userId) return;
    setLoadingEvents(true);
    try {
      const response = await axiosInstance.get(`/floriculture/watering/${userId}`);
      const events = response.data as WateringEvent[];
      const presence: Record<string, boolean> = {};
      events.forEach((event) => {
        if (event.watered && (!selectedFlowerId || event.flower_id === selectedFlowerId)) {
          const dateKey = event.watering_date.split("T")[0];
          presence[dateKey] = true;
        }
      });
      setWateringEvents(presence);
    } catch (error) {
      console.error("Error fetching watering events:", error);
    } finally {
      setLoadingEvents(false);
    }
  }, [userId, selectedFlowerId]);

  const fetchFlowersForDate = useCallback(async (date: Date) => {
    if (!userId) return;
    setLoadingFlowers(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await axiosInstance.get(`/floriculture/watering/${userId}/${dateStr}`);
      setFlowersForDate(response.data);
    } catch (error) {
      console.error("Error fetching flowers for date:", error);
    } finally {
      setLoadingFlowers(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWateringEvents();
  }, [fetchWateringEvents]);

  useEffect(() => {
    if (selectedDate) {
      fetchFlowersForDate(selectedDate);
    }
  }, [selectedDate, fetchFlowersForDate]);

  const handleWaterChange = async (flowerId: number, watered: boolean) => {
    if (!userId || !selectedDate) return;
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      await axiosInstance.post("/floriculture/watering", {
        userId: Number(userId),
        flowerId,
        date: dateStr,
        watered,
      });
      // Refresh data
      fetchFlowersForDate(selectedDate);
      fetchWateringEvents();
    } catch (error) {
      console.error("Error updating watering status:", error);
    }
  };

  const generateCalendar = (month: number, year: number): (number | null)[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array(firstDay)
      .fill(null)
      .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  };

  const calendarDays = generateCalendar(calendarMonth, calendarYear);
  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayClasses = (day: number | null): string => {
    if (day === null) return "text-gray-300 dark:text-gray-700 cursor-default";
    
    const date = new Date(calendarYear, calendarMonth, day);
    const dateKey = format(date, "yyyy-MM-dd");
    const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey;
    const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;

    let classes = "flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer relative ";
    
    if (isSelected) {
      classes += "bg-green-100 text-green-800 border-2 border-green-300 ";
    } else if (isToday) {
      classes += "bg-gray-400 dark:bg-gray-200 text-dark dark:text-light ";
    } else {
      classes += "text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-800 ";
    }

    return classes;
  };

  const filteredFlowers = useMemo(() => {
    return flowersForDate.filter(f => 
      f.flower_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flowersForDate, searchQuery]);

  return (
    <div className="bg-white dark:bg-gray-700 rounded-3xl border border-gray-400 dark:border-gray-200 w-full max-w-md h-[550px] flex flex-col transition-all duration-300 shadow-sm overflow-hidden relative">
      {/* Calendar Month View */}
      {!selectedDate ? (
        <div className="p-6 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                <Icon type="water_drop" className="text-blue-500" size="md" />
                Watering Calendar
              </h3>
              {selectedFlowerName && (
                <p className="text-xs font-semibold text-blue-500 dark:text-blue-300 ml-8 animate-in fade-in duration-300">
                  {selectedFlowerName}
                </p>
              )}
            </div>
          </div>
          
          <CalendarHeader
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            previousMonth={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
            nextMonth={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
          />

          <div className="grid grid-cols-7 gap-1 mt-6">
            {dayAbbreviations.map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-dark dark:text-light uppercase tracking-widest pb-2">
                {day.slice(0, 3)}
              </div>
            ))}
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-center h-10"
                onClick={() => day && setSelectedDate(new Date(calendarYear, calendarMonth, day))}
              >
                {day && (
                  <div className={`${getDayClasses(day)} !h-9 !w-9 text-xs transition-transform active:scale-90 flex items-center justify-center relative`}>
                    <span>{day}</span>
                    {wateringEvents[format(new Date(calendarYear, calendarMonth, day), "yyyy-MM-dd")] && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-in fade-in zoom-in duration-200"></span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-4 text-[10px] font-medium text-gray-500 dark:text-gray-400 border-t border-gray-400 dark:border-gray-200 pt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-dark dark:text-light">Watered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 shadow-sm"></div>
              <span className="text-dark dark:text-light">Today</span>
            </div>
          </div>
        </div>
      ) : (
        /* Watering Log Detail View */
        <div className="flex flex-col h-full bg-white dark:bg-gray-700 animate-in slide-in-from-right-8 fade-in duration-300 ease-out">
          <div className="p-6 border-b border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={() => setSelectedDate(null)}
                variant="ghost"
                size="sm"
                icon={{ left: "chevron_left" }}
                className="!p-2"
              />
              <div>
                <h4 className="text-base font-bold text-dark dark:text-light tracking-tight">
                  Watering Log
                </h4>
                <p className="text-xs text-dark dark:text-light font-medium">
                  {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="relative">
              <SearchBar 
                value={searchQuery}
                placeholder="Search flowers..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {loadingFlowers ? (
              <div className="flex flex-col items-center justify-center h-full text-dark dark:text-light py-12">
                <div className="relative h-12 w-12 mb-4">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide">FETCHING SCHEDULE...</span>
              </div>
            ) : filteredFlowers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-dark dark:text-light text-center py-12">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 opacity-50">
                  <Icon type="search_off" size="lg" />
                </div>
                <p className="text-sm font-bold text-dark dark:text-light">No flowers found</p>
                <p className="text-xs mt-1 text-dark dark:text-light">Try a different search term</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-dark dark:text-light">
                  <span>Flower</span>
                  <span>Watered ?</span>
                </div>
                <div className="space-y-3">
                  {filteredFlowers.map((flower) => {
                    const isWatered = flower.flower_watering.length > 0 && flower.flower_watering[0].watered;
                    return (
                      <div 
                        key={flower.flower_id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group border-gray-400 dark:border-gray-700 ${
                          isWatered 
                            ? "bg-blue-400 dark:bg-blue-900/20 " 
                            : "bg-white dark:bg-gray-800 "
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-2.5 rounded-xl transition-colors duration-300 bg-blue-300 text-blue-200`}>
                            <Icon type="local_florist" size="xs" />
                          </div>
                          <div className="min-w-0">
                            <span className={`block text-sm font-bold transition-colors ${
                              isWatered ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"
                            } truncate`}>
                              {flower.flower_name}
                            </span>
                            <span className="block text-xs text-gray-300">
                              {isWatered ? "Watered Today" : "Needs Water"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isWatered && (
                            <span className="text-xs font-bold text-blue-200 animate-in fade-in slide-in-from-right-1">
                              Watered
                            </span>
                          )}
                          <Checkbox
                            id={`watered-${flower.flower_id}`}
                            checked={isWatered}
                            onCheckedChange={(checked) => handleWaterChange(flower.flower_id, checked)}
                            className={`scale-110 transition-all ${isWatered ? "border-blue-500" : ""}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterCalendar;

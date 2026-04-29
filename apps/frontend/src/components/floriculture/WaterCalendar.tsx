import React, { useState, useEffect, useCallback, useMemo } from "react";
import CalendarHeader from "../ui/Calendar/CalendarHeader";
import axiosInstance from "@/lib/utils/axiosInstance";
import { Checkbox, Icon } from "@graminate/ui";
import { format } from "date-fns";
import WateringLogModal from "../modals/floriculture/WateringLogModal";

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

const WaterCalendar = ({ userId }: { userId: string | number }) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [wateringEvents, setWateringEvents] = useState<Record<string, boolean>>({});
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [flowersForDate, setFlowersForDate] = useState<FlowerWithWatering[]>([]);
  const [loadingFlowers, setLoadingFlowers] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWateringEvents = useCallback(async () => {
    if (!userId) return;
    setLoadingEvents(true);
    try {
      const response = await axiosInstance.get(`/floriculture/watering/${userId}`);
      const events = response.data as WateringEvent[];
      const presence: Record<string, boolean> = {};
      events.forEach((event) => {
        if (event.watered) {
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
  }, [userId]);

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
    const isWatered = wateringEvents[dateKey];
    const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey;
    const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;

    let classes = "flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ";
    
    if (isWatered) {
      classes += "bg-blue-200 text-blue-800 shadow-sm ";
    } else if (isSelected) {
      classes += "bg-green-100 text-green-800 border-2 border-green-300 ";
    } else if (isToday) {
      classes += "bg-gray-400 dark:bg-gray-200 text-dark dark:text-light ";
    } else {
      classes += "text-dark dark:text-light hover:bg-gray-400 dark:hover:bg-gray-800 ";
    }

    return classes;
  };

  const tableData = useMemo(() => {
    const filtered = flowersForDate.filter(f => 
      f.flower_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      columns: ["#", "Flower Name", "Watered"],
      rows: filtered.map((f) => [
        f.flower_id,
        f.flower_name,
        <div key={f.flower_id} className="flex justify-center">
          <Checkbox
            id={`watered-${f.flower_id}`}
            checked={f.flower_watering.length > 0 && f.flower_watering[0].watered}
            onCheckedChange={(checked) => handleWaterChange(f.flower_id, checked)}
          />
        </div>
      ]),
    };
  }, [flowersForDate, searchQuery, selectedDate]);

  return (
    <>
      <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-400 dark:border-gray-200 max-w-md w-full flex flex-col transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
            <Icon type="water_drop" className="text-blue-500" size="md" />
            Watering Calendar
          </h3>
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

        <div className="grid grid-cols-7 gap-1 mt-4">
          {dayAbbreviations.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-dark dark:text-light uppercase tracking-widest pb-1">
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
                <div className={`${getDayClasses(day)} !h-8 !w-8 text-xs`}>
                  {day}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-[10px] font-medium text-gray-500 dark:text-gray-400 border-t border-gray-400 dark:border-gray-200 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-300"></div>
            <span className="text-dark dark:text-light">Watered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            <span className="text-dark dark:text-light">Today</span>
          </div>
        </div>
      </div>

      <WateringLogModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate}
        flowersForDate={flowersForDate}
        loading={loadingFlowers}
        onWaterChange={handleWaterChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
    </>
  );
};

export default WaterCalendar;

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Line } from "react-chartjs-2";
import { Icon, Tabs } from "@graminate/ui";
import Loader from "@/components/ui/Loader";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

interface WeatherData {
  hourly: {
    time: string[];
    temperature2m: number[];
    uvIndexHourly: number[];
  };
  daily: {
    daylightDuration: number[];
    sunshineDuration: number[];
    time: string[];
  };
}

const SunlightCard = ({ method, selectedFlowerName, plantingDate }: { method?: string; selectedFlowerName?: string; plantingDate?: string }) => {
  const unitLabel = "PAR (µmol·m⁻²·s⁻¹)";
  const unitScale = 180;

  const { plan } = useUserPreferences();
  const isPro = plan === "PRO";

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [bestSunlightPeriod, setBestSunlightPeriod] = useState<string>("10:00 AM - 02:00 PM");

  useEffect(() => {
    let isMounted = true;
    const fetchCarePlan = async () => {
      if (!selectedFlowerName || !weatherData || !isPro) return;
      try {
        const startHourIndex = selectedDayIndex * 24;
        const endHourIndex = (selectedDayIndex + 1) * 24;
        const selectedDayHours = weatherData.hourly.time.slice(startHourIndex, endHourIndex);

        const dateKey = selectedDayHours[0] ? selectedDayHours[0].split("T")[0] : `day-${selectedDayIndex}`;
        const cacheKey = `best_sunlight_${selectedFlowerName}_${dateKey}`;

        const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          if (isMounted) setBestSunlightPeriod(cached);
          return;
        }

        const selectedDayUvs = weatherData.hourly.uvIndexHourly.slice(startHourIndex, endHourIndex);

        const solarDataSummary = selectedDayHours.map((time, idx) => {
          const hour = new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const par = selectedDayUvs[idx] * unitScale;
          return `${hour}: ${par.toFixed(0)} PAR`;
        }).join(", ");

        const res = await axiosInstance.post("/llm", {
          history: [
            {
              sender: "user",
              text: `Considering the scientific growth requirements of "${selectedFlowerName}", analyze the following forecasted solar patterns for the selected day: ${solarDataSummary}. What is the exact best sunlight period of the day for the flower today? Answer only in valid JSON format with the keys: "best_sunlight_period" (string with from/to hours like "10:00 AM - 02:00 PM").`
            }
          ],
          userId: "anonymous",
          token: typeof window !== "undefined" ? localStorage.getItem("token") || "test_token" : "test_token"
        });
        const match = res.data?.answer?.match(/\{[\s\S]*?\}/);
        if (match && isMounted) {
          const parsed = JSON.parse(match[0]);
          if (parsed.best_sunlight_period) {
            setBestSunlightPeriod(parsed.best_sunlight_period);
            if (typeof window !== "undefined") {
              localStorage.setItem(cacheKey, parsed.best_sunlight_period);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching sunlight plan via LLM:", err);
      }
    };
    fetchCarePlan();
    return () => { isMounted = false; };
  }, [selectedFlowerName, weatherData, selectedDayIndex]);

  useEffect(() => {
    let isMounted = true;

    const loadWeatherWithCoords = async (latitude: number, longitude: number) => {
      setLoading(true);
      try {
        const latFixed = parseFloat(latitude.toFixed(4));
        const lonFixed = parseFloat(longitude.toFixed(4));
        const response = await axios.get("/api/weather", {
          params: { lat: latFixed, lon: lonFixed },
        });
        if (isMounted) {
          setWeatherData(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isMounted) {
            loadWeatherWithCoords(pos.coords.latitude, pos.coords.longitude);
          }
        },
        (err) => {
          console.error(err);
          if (isMounted) {
            loadWeatherWithCoords(26.14, 91.73);
          }
        },
        { timeout: 5000 }
      );
    } else {
      loadWeatherWithCoords(26.14, 91.73);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const calculateSunTimes = (daylightSeconds: number) => {
    const daylightHours = daylightSeconds / 3600;
    const halfDaylight = daylightHours / 2;
    const solarNoonMinutes = 12 * 60;
    const sunriseMinutes = solarNoonMinutes - halfDaylight * 60;
    const sunsetMinutes = solarNoonMinutes + halfDaylight * 60;

    const formatFromMins = (mins: number) => {
      const d = new Date();
      d.setHours(Math.floor(mins / 60), Math.floor(mins % 60), 0, 0);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return {
      sunrise: formatFromMins(sunriseMinutes),
      sunset: formatFromMins(sunsetMinutes),
    };
  };

  const sunTimes = weatherData?.daily.daylightDuration[selectedDayIndex]
    ? calculateSunTimes(weatherData.daily.daylightDuration[selectedDayIndex])
    : { sunrise: "--:--", sunset: "--:--" };

  const sunshineHours = weatherData?.daily.sunshineDuration[selectedDayIndex]
    ? (weatherData.daily.sunshineDuration[selectedDayIndex] / 3600).toFixed(1)
    : "N/A";

  const daylightSeconds = weatherData?.daily.daylightDuration[selectedDayIndex] || 0;
  const daylightHours = daylightSeconds / 3600;
  const halfDaylightMins = (daylightHours / 2) * 60;
  const solarNoonMins = 12 * 60;
  const sunriseMins = solarNoonMins - halfDaylightMins;
  const sunsetMins = solarNoonMins + halfDaylightMins;

  const startHourIndex = selectedDayIndex * 24;
  const endHourIndex = (selectedDayIndex + 1) * 24;
  const dailyHours = weatherData?.hourly.time.slice(startHourIndex, endHourIndex) || [];
  const dailyUvs = weatherData?.hourly.uvIndexHourly.slice(startHourIndex, endHourIndex) || [];

  const hourlyTimes = dailyHours.map(t => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const sunlightValues = dailyUvs.map((v) => v * unitScale);

  const bestSunlightRange = useMemo(() => {
    if (!bestSunlightPeriod) return null;
    const regex = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i;
    const match = bestSunlightPeriod.match(regex);
    if (match) {
      return { start: match[1], end: match[2] };
    }
    return null;
  }, [bestSunlightPeriod]);

  const parseHourMins = (timeStr: string): number | null => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (!match) return null;
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm.toLowerCase() === "pm" && hrs < 12) hrs += 12;
      if (ampm.toLowerCase() === "am" && hrs === 12) hrs = 0;
    }
    return hrs * 60 + mins;
  };

  const bestRangeMins = useMemo(() => {
    if (!bestSunlightRange) return null;
    const startMins = parseHourMins(bestSunlightRange.start);
    const endMins = parseHourMins(bestSunlightRange.end);
    if (startMins !== null && endMins !== null) {
      return { start: startMins, end: endMins };
    }
    return null;
  }, [bestSunlightRange]);

  const bestPeriodValues = sunlightValues.map((v, i) => {
    if (!bestRangeMins) return null;
    const hDate = new Date(dailyHours[i]);
    const hMins = hDate.getHours() * 60 + hDate.getMinutes();
    return hMins >= bestRangeMins.start && hMins <= bestRangeMins.end ? v : null;
  });

  const chartData = {
    labels: hourlyTimes,
    datasets: [
      {
        label: `Sunlight ${unitLabel}`,
        data: sunlightValues,
        borderColor: "rgba(245, 158, 11, 0.8)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.3,
        fill: true,
      },
      ...(isPro && selectedFlowerName ? [
        {
          label: "Best Sunlight Period (AI Recommended)",
          data: bestPeriodValues,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.25)",
          tension: 0.3,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: "rgba(34, 197, 94, 1)",
        },
      ] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "currentColor", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(156, 163, 175, 0.1)" },
        ticks: { color: "currentColor", font: { size: 10 } },
      },
    },
  };

  const tabItems = useMemo(() => {
    if (!weatherData) return [];
    return (weatherData.daily.time || [])
      .map((time, i) => {
        const dayLabel = i === 0 ? "Today" : new Date(time).toLocaleDateString("en-US", { weekday: "short" });
        return {
          value: String(i),
          label: dayLabel,
          content: null,
          date: time,
        };
      })
      .filter(item => {
        if (!plantingDate) return true;
        const pDate = new Date(plantingDate);
        if (isNaN(pDate.getTime())) return true;
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        pDate.setHours(0, 0, 0, 0);
        return itemDate >= pDate;
      });
  }, [weatherData, plantingDate]);

  useEffect(() => {
    if (tabItems.length > 0) {
      const exists = tabItems.some(i => i.value === String(selectedDayIndex));
      if (!exists) {
        setSelectedDayIndex(Number(tabItems[0].value));
      }
    }
  }, [tabItems, selectedDayIndex]);

  return (
    <div className="bg-white dark:bg-gray-700 rounded-3xl border border-gray-400 dark:border-gray-700 p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
            <Icon type="wb_sunny" className="text-amber-500" />
            Sunlight Metrics
          </h3>
          <p className="text-xs text-dark dark:text-light">Current daylight and hourly solar tracking</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Loader />
        </div>
      ) : !weatherData ? (
        <p className="text-center text-sm py-12">Weather data unavailable</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-600 rounded-2xl p-3 border border-gray-400 dark:border-gray-700 flex flex-col gap-1 justify-between">
              <span className="text-xs font-bold text-dark dark:text-light">Actual Duration</span>
              <span className="text-xl font-black text-red-200 dark:text-amber-400">{sunshineHours} h</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-600 rounded-2xl p-3 border border-gray-400 dark:border-gray-700 flex flex-col gap-1 justify-between">
              <span className="text-xs font-bold text-dark dark:text-light">Sunrise</span>
              <span className="text-xl font-black text-red-200 dark:text-orange-400">{sunTimes.sunrise}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-600 rounded-2xl p-3 border border-gray-400 dark:border-gray-700 flex flex-col gap-1 justify-between">
              <span className="text-xs font-bold text-dark dark:text-light">Sunset</span>
              <span className="text-xl font-black text-red-200 dark:text-rose-400">{sunTimes.sunset}</span>
            </div>
            {isPro && selectedFlowerName && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-3 border border-green-200 dark:border-green-700/50 flex flex-col gap-1 justify-between sm:col-span-3 animate-in fade-in duration-300">
                <span className="text-xs font-bold text-green-700 dark:text-green-400">Best Sunlight Period (AI Recommended)</span>
                <span className="text-sm font-black text-green-800 dark:text-green-300">
                  {bestSunlightPeriod || "Loading..."}
                </span>
              </div>
            )}
          </div>

          {tabItems.length > 0 && (
            <div className="border-t border-gray-400 dark:border-gray-700 pt-4">
              <Tabs
                tabs={tabItems}
                activeTab={String(selectedDayIndex)}
                onTabChange={(val) => setSelectedDayIndex(Number(val))}
              />
            </div>
          )}

          <div className="h-[250px] w-full bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-400 dark:border-gray-700 relative mt-2">
            <Line data={chartData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SunlightCard;

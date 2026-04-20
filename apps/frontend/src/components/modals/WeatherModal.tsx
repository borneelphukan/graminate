import { Icon, cn, Button } from "@graminate/ui";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import { useLocationName } from "@/hooks/weather";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import UVScale from "./UVScale";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number | null;
  lon: number | null;
}

type WeatherData = {
  current: {
    temperature2m: number;
    relativeHumidity2m: number;
    apparentTemperature: number;
    isDay: number;
    precipitation: number;
    windSpeed10m: number;
    cloudCover: number;
  };
  daily: {
    temperature2mMax: number[];
    temperature2mMin: number[];
    daylightDuration: number[];
    uvIndexMax: number[];
    precipitationSum: number[];
    time: Date[];
  };
  hourly: {
    temperature2m: number[];
    uvIndexHourly: number[];
    time: Date[];
  };
};

const WeatherModal = ({ isOpen, onClose, lat, lon }: WeatherModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { temperatureScale, timeFormat } = useUserPreferences();
  const { locationName } = useLocationName({ lat: lat || 0, lon: lon || 0 });
  const [activeView, setActiveView] = useState<"summary" | "detailed">("summary");

  const fetchFullWeather = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    try {
      const response = await axios.get("/api/weather", { params: { lat, lon } });
      setData(response.data);
    } catch (err: unknown) {
      setError("Failed to fetch weather details");
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (isOpen && lat && lon) {
      fetchFullWeather();
    }
  }, [isOpen, lat, lon, fetchFullWeather]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTemp = (val: number) => {
    if (temperatureScale === "Fahrenheit") {
      return `${Math.round(val * 1.8 + 32)}°F`;
    }
    return `${Math.round(val)}°C`;
  };

  const getUVRisk = (uv: number) => {
    if (uv <= 2) return { label: "Low", color: "text-green-400" };
    if (uv <= 5) return { label: "Moderate", color: "text-yellow-400" };
    if (uv <= 7) return { label: "High", color: "text-orange-400" };
    if (uv <= 10) return { label: "Very High", color: "text-red-400" };
    return { label: "Extreme", color: "text-purple-400" };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getTimeString = useCallback((date: Date | string | number) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12-hour",
    });
  }, [timeFormat]);

  const calculateSunTimes = useCallback((daylightSeconds: number) => {
    const daylightHours = daylightSeconds / 3600;
    const halfDaylight = daylightHours / 2;
    const solarNoonMinutes = 12 * 60;
    const sunriseMinutes = solarNoonMinutes - halfDaylight * 60;
    const sunsetMinutes = solarNoonMinutes + halfDaylight * 60;

    const formatFromMins = (mins: number) => {
      const d = new Date();
      d.setHours(Math.floor(mins / 60), Math.floor(mins % 60), 0, 0);
      return getTimeString(d);
    };

    return {
      sunrise: formatFromMins(sunriseMinutes),
      sunset: formatFromMins(sunsetMinutes),
    };
  }, [getTimeString]);

  const sunTimes = useMemo(() => {
    if (!data?.daily.daylightDuration[0]) return { sunrise: "--:--", sunset: "--:--", sunriseMins: 0, sunsetMins: 0 };
    const { sunrise, sunset } = calculateSunTimes(data.daily.daylightDuration[0]);
    
    const getMins = (timeStr: string) => {
      const isPM = timeStr.toLowerCase().includes("pm");
      const isAM = timeStr.toLowerCase().includes("am");
      let [h, m] = timeStr.replace(/[ap]m/i, "").trim().split(":").map(Number);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return h * 60 + m;
    };

    return { 
      sunrise, 
      sunset, 
      sunriseMins: getMins(sunrise), 
      sunsetMins: getMins(sunset) 
    };
  }, [data, calculateSunTimes]);

  const sunTrajectoryT = useMemo(() => {
    if (!sunTimes.sunriseMins || !sunTimes.sunsetMins) return 0;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const t = (nowMins - sunTimes.sunriseMins) / (sunTimes.sunsetMins - sunTimes.sunriseMins);
    return Math.max(0, Math.min(1, t));
  }, [sunTimes]);

  const getSunPos = (t: number) => {
    const x = Math.pow(1 - t, 2) * 0 + 2 * (1 - t) * t * 80 + Math.pow(t, 2) * 160;
    const y = Math.pow(1 - t, 2) * 50 + 2 * (1 - t) * t * 0 + Math.pow(t, 2) * 50;
    return { x, y };
  };

  const sunPos = getSunPos(sunTrajectoryT);

  if (!isOpen) return null;

  const currentMonthDay = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const isDay = data?.current.isDay === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative"
      >
        {/* FIXED HEADER */}
        <div className="sticky top-0 z-[60] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-8 lg:px-12 py-6 border-b border-gray-400 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {activeView === "detailed" && (
              <Button 
                onClick={() => setActiveView("summary")}
                variant="secondary"
                shape="circle"
                icon={{ left: "chevron_left" }}
                className="shrink-0"
              />
            )}
            <div>
              <p className="text-sm text-dark dark:text-light font-bold tracking-tight uppercase leading-none opacity-60">
                {activeView === "summary" ? "Local Weather" : "Forecast Report"}
              </p>
              <h2 className="text-xl font-black text-dark dark:text-light mt-1">
                {locationName || "Detecting..."}
              </h2>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <p className="text-sm font-bold text-dark dark:text-light leading-none">{currentMonthDay}</p>
             <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-40 mt-1 tracking-widest">Environmental Insights</p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <Loader />
          </div>
        ) : error || !data ? (
          <div className="flex-1 flex items-center justify-center p-20 text-red-500 text-center">
            {error || "No data available"}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className={cn(
              "w-full overflow-y-auto overflow-x-hidden relative flex-1 flex flex-col transition-all duration-500 custom-scrollbar",
              activeView === "detailed" && "min-h-[700px]"
            )}>
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-green/20 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

              <div 
                className={cn(
                  "flex w-[200%] h-full transition-transform duration-700 ease-in-out relative z-10 flex-1",
                  activeView === "detailed" ? "-translate-x-1/2" : "translate-x-0"
                )}
              >
                {/* VIEW 1: Summary Dashboard */}
                <div className="w-1/2 flex flex-col lg:flex-row">
                  {/* Left Section: Main Highlights */}
                  <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-400 dark:border-gray-700">
                    <div className="flex items-center gap-6 mb-8 mt-2">
                      <h1 className="text-5xl lg:text-7xl text-dark dark:text-light font-black tracking-tighter drop-shadow-2xl">
                        {formatTemp(data.current.temperature2m)}
                      </h1>
                      <div className="flex flex-col gap-2">
                        <Icon type={isDay ? "light_mode" : "dark_mode"} className="size-12 text-yellow-200 drop-shadow-glow" />
                        <p className="text-2xl text-dark dark:text-light font-black uppercase tracking-widest leading-none">
                          {data.current.cloudCover > 50 ? "Cloudy" : "Clear Sky"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 bg-white/5 w-fit px-6 py-4 rounded-3xl border border-gray-400 dark:border-gray-700 backdrop-blur-sm shadow-xl">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Icon type="arrow_upward" className="size-5 text-red-400" />
                          <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.daily.temperature2mMax[0])}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon type="arrow_downward" className="size-5 text-blue-300" />
                          <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.daily.temperature2mMin[0])}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-400/30 dark:bg-gray-700/30" />
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 text-dark dark:text-light">Feels like</span>
                        <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.current.apparentTemperature)}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mt-12">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-gray-400 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Icon type="water_drop" className="text-blue-400 size-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 leading-none mb-1">Humidity</p>
                            <p className="text-lg font-black text-dark dark:text-light leading-none">{Math.round(data.current.relativeHumidity2m)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-gray-400 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Icon type="air" className="size-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 leading-none mb-1">Wind Speed</p>
                            <p className="text-lg font-black text-dark dark:text-light leading-none">{data.current.windSpeed10m.toFixed(1)} km/h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Detailed Metrics Grid */}
                  <div className="lg:flex-1 p-8 lg:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      {/* UV Index Card */}
                      <div className="bg-white/10 p-6 rounded-3xl border border-gray-400 dark:border-gray-700 flex flex-col justify-between hover:bg-white/15 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-dark dark:text-light font-bold uppercase tracking-widest opacity-70">UV Index</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-4xl font-black text-dark dark:text-light">{Math.round(data.daily.uvIndexMax[0])}</p>
                          <p className={cn("font-bold mt-1 text-dark dark:text-light", getUVRisk(data.daily.uvIndexMax[0]).color)}>
                            {getUVRisk(data.daily.uvIndexMax[0]).label} Risk
                          </p>
                        </div>
                        <UVScale uvIndex={data.daily.uvIndexMax[0]} />
                      </div>

                      {/* Sun & Daylight Card */}
                      <div className="bg-white/10 p-6 rounded-3xl border border-gray-400 dark:border-gray-700 flex flex-col justify-between hover:bg-white/15 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-dark dark:text-light uppercase tracking-widest opacity-70">Daylight</span>
                        </div>
                        <div className="relative h-24 mb-6 text-dark dark:text-light">
                          <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                            <path 
                              d="M 0 50 Q 80 0 160 50" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeOpacity="0.2"
                              strokeWidth="2" 
                              strokeDasharray="4 4"
                            />
                            <path 
                              d={`M 0 50 Q 80 0 160 50`} 
                              fill="none" 
                              stroke="currentColor" 
                              strokeOpacity="0.6"
                              strokeWidth="2"
                              style={{
                                strokeDasharray: 200,
                                strokeDashoffset: 200 - (sunTrajectoryT * 200)
                              }}
                            />
                            <line x1="-10" y1="50" x2="170" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                            <g transform={`translate(${sunPos.x}, ${sunPos.y})`}>
                              <circle r="6" fill="#fbbf24" className="shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                              <circle r="8" fill="rgba(251,191,36,0.3)" />
                            </g>
                          </svg>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center pointer-events-none">
                            <p className="text-2xl font-black text-dark dark:text-light">{formatTime(data.daily.daylightDuration[0])}</p>
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 tracking-tighter">Daylight Duration</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-400 dark:border-gray-700 pt-4">
                          <div className="flex flex-col items-start gap-1">
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 tracking-wider">Sunrise</p>
                            <p className="font-bold text-lg text-dark dark:text-light leading-none">{sunTimes.sunrise}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 tracking-wider">Sunset</p>
                            <p className="font-bold text-lg text-dark dark:text-light leading-none">{sunTimes.sunset}</p>
                          </div>
                        </div>
                      </div>

                      {/* Precipitation Card */}
                      <div className="bg-white/10 p-6 rounded-3xl border border-gray-400 dark:border-gray-700 flex flex-col justify-between hover:bg-white/15 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-dark dark:text-light uppercase tracking-widest opacity-70">Precipitation</span>
                          <Icon type="umbrella" className="text-purple-300" />
                        </div>
                        <div>
                          <p className="text-4xl font-black text-dark dark:text-light">{data.daily.precipitationSum[0].toFixed(1)} <span className="text-xl font-medium opacity-60">mm</span></p>
                          <p className="text-sm text-dark dark:text-light opacity-80 mt-2">Next 24h: {data.daily.precipitationSum[1].toFixed(1)} mm expected</p>
                        </div>
                        <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, data.daily.precipitationSum[0] * 5)}%` }} />
                        </div>
                      </div>

                      {/* Weekly Forecast Summary */}
                      <div className="bg-white/10 p-6 rounded-3xl border border-gray-400 dark:border-gray-700 flex flex-col justify-between hover:bg-white/15 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-dark dark:text-light uppercase tracking-widest opacity-70">Forecast</span>
                          <Icon type="calendar_month" className="text-green-300" />
                        </div>
                        <div className="flex justify-between items-center px-1">
                          {data.daily.time.slice(1, 5).map((time, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                              <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-60">
                                {new Date(time).toLocaleDateString("en-US", { weekday: "short" })}
                              </p>
                              <Icon type={data.daily.precipitationSum[i+1] > 0 ? "cloud" : "wb_sunny"} className="size-5" />
                              <p className="text-xs font-bold text-dark dark:text-light">{Math.round(data.daily.temperature2mMax[i+1])}°</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <button 
                            onClick={() => setActiveView("detailed")}
                            className="w-full text-[10px] font-black uppercase tracking-widest text-white bg-brand-green hover:bg-brand-green/90 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 group"
                          >
                            View full report
                            <Icon type="arrow_forward" className="size-3.5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIEW 2: Detailed Forecast View */}
                <div className="w-1/2 p-8 lg:p-12 flex flex-col bg-black/5 dark:bg-black/20 backdrop-blur-3xl h-full">
                  <div className="flex-1 space-y-8 pr-2">
                    {/* Hourly Forecast */}
                    <section className="relative overflow-hidden">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-50 text-dark dark:text-light">Hourly Forecast</h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {data.hourly.time.slice(0, 24).map((time, i) => (
                          <div key={i} className="flex flex-col items-center min-w-[72px] shrink-0 p-4 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-700 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] font-bold opacity-60 mb-2 whitespace-nowrap text-dark dark:text-light">{getTimeString(time)}</p>
                            <Icon type={data.hourly.uvIndexHourly[i] > 3 ? "wb_sunny" : "cloud"} className="size-6 text-yellow-300 my-2" />
                            <p className="text-lg font-black text-dark dark:text-light">{Math.round(data.hourly.temperature2m[i])}°</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 10 Day Forecast */}
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-50 text-dark dark:text-light">10-Day Forecast</h3>
                      <div className="space-y-2 pb-4">
                        {data.daily.time.slice(0, 10).map((time, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-700 hover:bg-white/10 transition-colors">
                            <div className="w-1/4">
                              <p className="font-bold text-dark dark:text-light">
                                {i === 0 ? "Today" : new Date(time).toLocaleDateString("en-US", { weekday: "long" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 w-1/4 justify-center">
                              <Icon type={data.daily.precipitationSum[i] > 2 ? "umbrella" : data.daily.uvIndexMax[i] > 5 ? "wb_sunny" : "cloud"} className="size-5" />
                              {data.daily.precipitationSum[i] > 0 && <span className="text-[10px] font-bold text-blue-300">{Math.round(data.daily.precipitationSum[i])}mm</span>}
                            </div>
                            <div className="w-2/4 flex items-center justify-end gap-4">
                              <span className="opacity-40 font-bold text-dark dark:text-light">{Math.round(data.daily.temperature2mMin[i])}°</span>
                              <div className="w-24 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                                <div 
                                  className="absolute h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                                  style={{ left: "20%", right: "20%" }} 
                                />
                              </div>
                              <span className="font-bold text-dark dark:text-light">{Math.round(data.daily.temperature2mMax[i])}°</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherModal;

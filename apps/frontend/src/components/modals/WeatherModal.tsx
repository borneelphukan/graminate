import { Icon, cn, Button, type IconType } from "@graminate/ui";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import ReactMarkdown from 'react-markdown';
import { useLocationName } from "@/hooks/weather";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import UVScale from "./UVScale";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number | null;
  lon: number | null;
  module?: "poultry" | "cattle_rearing";
  contextData?: Record<string, unknown>;
  userId?: string;
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

const WeatherModal = ({ 
  isOpen, 
  onClose, 
  lat, 
  lon, 
  module, 
  contextData,
  userId
}: WeatherModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { temperatureScale, timeFormat, plan, language } = useUserPreferences();
  const [internalCoords, setInternalCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if ((!lat || !lon) && isOpen) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setInternalCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          (err) => {
            console.error("Internal geolocation error:", err);
            setError("Location access denied. Please enable location to see weather.");
          }
        );
      }
    }
  }, [lat, lon, isOpen]);

  const effectiveLat = lat || internalCoords?.lat;
  const effectiveLon = lon || internalCoords?.lon;

  const { locationName } = useLocationName({ lat: effectiveLat || 0, lon: effectiveLon || 0 });
  const [activeView, setActiveView] = useState<"summary" | "detailed">("summary");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastFetchedAI, setLastFetchedAI] = useState<Date | null>(null);

  useEffect(() => {
    if (userId && module && isOpen) {
      const cached = localStorage.getItem(`ai_weather_${userId}_${module}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAiSuggestions(parsed.text);
          setLastFetchedAI(new Date(parsed.timestamp));
        } catch (e) {
          console.error("Failed to parse cached AI suggestions:", e);
        }
      }
    }
  }, [userId, module, isOpen]);

  const fetchFullWeather = useCallback(async () => {
    if (!effectiveLat || !effectiveLon) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/weather", { params: { lat: effectiveLat, lon: effectiveLon } });
      setData(response.data);
      setLastFetched(new Date());
    } catch {
      setError("Failed to fetch weather details");
    } finally {
      setLoading(false);
    }
  }, [effectiveLat, effectiveLon]);

  const fetchAISuggestions = useCallback(async () => {
    if (!data || !module || !contextData || plan !== "PRO") return;
    setLoadingAI(true);
    try {
      const prompt = `Weather: ${data.current.temperature2m.toFixed(1)}°C, ${data.current.relativeHumidity2m.toFixed(1)}% humidity. 
      Farm Context: ${JSON.stringify(contextData)}. 
      For this ${module.replace("_", " ")} farm, provide brief "things to do" to maintain productivity under current conditions.
      
      Structure:
      1. Use these exact headers in bold: **Temperature (${data.current.temperature2m.toFixed(1)}°C)**, **Humidity (${data.current.relativeHumidity2m.toFixed(1)}%)**, **Daylight (${(data.daily.daylightDuration[0] / 3600).toFixed(1)} hours)**, **Precipitation (${data.daily.precipitationSum[0].toFixed(1)} mm)**, and **Wind (${data.current.windSpeed10m.toFixed(1)} km/h)**.
      2. Under each header, provide 1-2 very brief, concise, and direct action points using **unordered bullet points** (- or *).
      3. Use available inventory/data from the context if relevant.
      4. Do NOT list the weather values or farm data points themselves.
      5. Response ONLY in ${language} language.
      6. Start directly with the first header. No intro or titles.
      7. Use very simple language for a farmer.`;
      
      const response = await axios.post("/api/llm", {
        history: [{ sender: "user", text: prompt }],
        userId: userId || "1",
        token: "internal",
      });
      setAiSuggestions(response.data.answer);
      const now = new Date();
      setLastFetchedAI(now);
      if (userId && module) {
        localStorage.setItem(`ai_weather_${userId}_${module}`, JSON.stringify({
          text: response.data.answer,
          timestamp: now.getTime()
        }));
      }
    } catch (err) {
      console.error("AI fetch error:", err);
      setAiSuggestions("Unable to load AI suggestions at this time.");
    } finally {
      setLoadingAI(false);
    }
  }, [data, module, contextData, plan, userId, language]);

  useEffect(() => {
    if (isOpen && effectiveLat && effectiveLon) {
      fetchFullWeather();
    }
  }, [isOpen, effectiveLat, effectiveLon, fetchFullWeather]);

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
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
      const [hStr, mStr] = timeStr.replace(/[ap]m/i, "").trim().split(":");
      let h = Number(hStr);
      const m = Number(mStr);
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
        className="bg-white dark:bg-gray-800 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl relative"
      >
        {/* FIXED HEADER */}
        <div className="sticky top-0 z-[60] bg-white/80 dark:bg-gray-700 px-6 lg:px-10 py-4 flex items-center justify-between shrink-0 border-b border-gray-400 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {activeView === "detailed" && (
              <Button 
                onClick={() => setActiveView("summary")}
                variant="ghost"
                icon={{ left: "chevron_left" }}
                className="shrink-0"
              />
            )}
            <div>
              <p className="text-sm text-dark dark:text-light font-bold tracking-tight uppercase leading-none opacity-60">
                {activeView === "summary" ? (locationName || "Local Weather") : "Forecast Report"}
              </p>
              <h2 className="text-xl font-black text-dark dark:text-light mt-1 flex items-center gap-2">
                {activeView === "summary" ? "Current Conditions" : "Extended Forecast"}
                {lastFetched && (
                  <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest bg-gray-400/10 px-2 py-0.5 rounded-full">
                    Updated {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:flex flex-col items-end border-r border-gray-400 dark:border-gray-700 pr-4 mr-1">
               <p className="text-sm font-bold text-dark dark:text-light leading-none">{currentMonthDay}</p>
               <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-40 mt-1 tracking-widest">Environmental Insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={onClose}
                variant="ghost"
                icon={{ left: "close" }}
                className="text-dark dark:text-light opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-20 text-red-500 text-center flex-col gap-4">
            <Icon type="location_off" className="size-12 opacity-50" />
            <p className="font-bold">{error}</p>
          </div>
        ) : !data && (!effectiveLat || !effectiveLon) ? (
          <div className="flex-1 flex items-center justify-center p-20 text-dark dark:text-light opacity-60 text-center">
            <div className="flex flex-col items-center gap-6">
              <Loader />
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Detecting Location...</p>
                <p className="text-[10px] opacity-50">Please ensure GPS is enabled for weather insights.</p>
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <Loader />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className={cn(
              "w-full overflow-y-auto overflow-x-hidden relative flex-1 flex flex-col transition-all duration-500 custom-scrollbar",
              activeView === "detailed" && "min-h-[550px]"
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
                  <div className="lg:w-2/5 p-6 lg:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-400 dark:border-gray-700">
                    <div className="flex items-center gap-6 mb-6 mt-1">
                      <h1 className="text-4xl lg:text-6xl text-dark dark:text-light font-black tracking-tighter">
                        {formatTemp(data.current.temperature2m)}
                      </h1>
                      <div className="flex flex-col gap-2">
                        <Icon type={isDay ? "light_mode" : "dark_mode"} className="size-12 text-yellow-200" />
                        <p className="text-2xl text-dark dark:text-light font-black uppercase tracking-widest leading-none">
                          {data.current.cloudCover > 50 ? "Cloudy" : "Clear Sky"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 bg-white/5 w-fit px-6 py-4 rounded-3xl border border-gray-400 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Icon type="arrow_upward" className="size-5 text-red-200" />
                          <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.daily.temperature2mMax[0])}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon type="arrow_downward" className="size-5 text-blue-200" />
                          <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.daily.temperature2mMin[0])}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-400 dark:bg-gray-700" />
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 text-dark dark:text-light">Feels like</span>
                        <span className="text-xl font-black text-dark dark:text-light leading-none">{formatTemp(data.current.apparentTemperature)}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mt-8">
                      <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-2xl border border-gray-400 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-500 rounded-lg">
                            <Icon type="water_drop" className="text-dark size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 leading-none mb-1">Humidity</p>
                            <p className="text-base font-black text-dark dark:text-light leading-none">{Math.round(data.current.relativeHumidity2m)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-2xl border border-gray-400 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-500 rounded-lg">
                            <Icon type="air" className="text-dark size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-dark dark:text-light opacity-50 leading-none mb-1">Wind Speed</p>
                            <p className="text-base font-black text-dark dark:text-light leading-none">{data.current.windSpeed10m.toFixed(1)} km/h</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {module && (
                      <div className="mt-8 relative overflow-hidden rounded-[2rem] border border-gray-400 dark:border-gray-700 group flex flex-col max-h-[400px]">
                        <div className="absolute -top-6 -right-6 opacity-20 pointer-events-none transform rotate-12 transition-transform duration-700 group-hover:rotate-45">
                          <Icon type="auto_awesome" className="size-32 text-green-400 blur-[2px]" />
                        </div>
                        <div className="relative z-10 p-6 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-5 shrink-0">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-gradient-to-br from-green-400/30 to-green-600/10 rounded-xl shadow-inner border border-green-400/20">
                                 <Icon type="auto_awesome" className="text-green-600 dark:text-green-300 size-5" />
                               </div>
                              <div className="flex flex-col">
                                <h3 className="text-green-100 dark:text-green-300 text-xs uppercase tracking-widest">AI Recommendations</h3>
                                {lastFetchedAI && (
                                  <span className="text-[8px] text-dark dark:text-light uppercase leading-none mt-1">
                                    Last updated: {lastFetchedAI.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>
                            {plan === "PRO" && (
                                <Button
                                  onClick={fetchAISuggestions}
                                  disabled={loadingAI}
                                  variant="ghost"
                                  title={!aiSuggestions ? "Generate Recommendations" : "Refresh Recommendations"}
                                  icon={{
                                    left: "auto_awesome" as IconType
                                  }}
                                />
                            )}
                          </div>
                          
                          <div className={cn("overflow-y-auto pr-2 flex-1 relative", aiSuggestions || loadingAI ? "min-h-[120px]" : "min-h-0")}>
                            {plan !== "PRO" ? (
                              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-4 animate-in zoom-in duration-500">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-yellow-400 blur-2xl rounded-full animate-pulse" />
                                  <Icon type="workspace_premium" className="size-12 text-yellow-500 relative z-10" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black uppercase tracking-widest text-dark dark:text-light">Pro Feature</h4>
                                  <p className="text-[11px] text-dark dark:text-light opacity-60 max-w-[200px] leading-relaxed mx-auto">
                                    Upgrade to Graminate Pro to unlock hyper-local AI farming advice.
                                  </p>
                                </div>
                                <Button 
                                  label="Upgrade Now"
                                  variant="primary" 
                                  size="sm" 
                                  onClick={() => window.open(`/${userId}/pricing`, '_blank')}
                                />
                              </div>
                            ) : loadingAI ? (
                              <div className="space-y-4 py-2 animate-in fade-in duration-500">
                                <div className="h-4 w-1/3 bg-gray-300 rounded mb-4 animate-pulse" />
                                <div className="flex gap-3 items-center">
                                  <div className="size-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="h-1.5 w-full bg-gray-300 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-300 w-1/2 animate-pulse" />
                                  </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                  <div className="size-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="h-1.5 w-4/5 bg-gray-300 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-300 w-2/3 animate-pulse delay-75" />
                                  </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                  <div className="size-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                                  <div className="h-1.5 w-5/6 bg-gray-300 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-300 w-3/4 animate-pulse delay-150" />
                                  </div>
                                </div>
                              </div>
                            ) : aiSuggestions ? (
                              <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-1000 ease-out fill-mode-both prose prose-invert prose-green max-w-none text-dark dark:text-light/90 prose-headings:text-[8px] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-[0.15em] prose-headings:text-green-600 dark:prose-headings:text-green-400 prose-headings:mt-4 prose-headings:mb-1 prose-p:text-[5px] prose-p:leading-relaxed prose-p:mb-2 prose-li:text-[5px] prose-li:my-0.5 prose-li:marker:text-[7px] prose-li:marker:text-green-500 prose-ul:list-inside prose-ul:pl-0 prose-strong:font-black prose-strong:text-green-600 dark:prose-strong:text-green-400 font-medium selection:bg-green-500/30">
                                <ReactMarkdown>
                                  {aiSuggestions}
                                </ReactMarkdown>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section: Detailed Metrics Grid */}
                  <div className="lg:flex-1 p-6 lg:p-10">
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
                      <div 
                        onClick={() => setActiveView("detailed")}
                        className="bg-white/10 p-6 rounded-3xl border border-gray-400 dark:border-gray-700 flex flex-col justify-between hover:bg-white/15 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-dark dark:text-light uppercase tracking-widest opacity-70">Forecast</span>
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
                          <Button 
                            label="View Forecast"
                            icon={{right: "chevron_right"}}
                            variant="outline"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIEW 2: Detailed Forecast View */}
                <div className="w-1/2 p-6 lg:p-10 flex flex-col h-full">
                  <div className="flex-1 space-y-8 pr-2">
                    {/* Hourly Forecast */}
                    <section className="relative overflow-hidden">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-50 text-dark dark:text-light">Hourly Forecast</h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {data.hourly.time.slice(0, 24).map((time, i) => (
                          <div key={i} className="flex flex-col items-center min-w-[72px] shrink-0 p-4 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-700 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] font-bold opacity-60 mb-2 whitespace-nowrap text-dark dark:text-light">{getTimeString(time)}</p>
                            <Icon type={data.hourly.uvIndexHourly[i] > 3 ? "wb_sunny" : "cloud"} className="size-6 text-yellow-200 my-2" />
                            <p className="text-lg font-black text-dark dark:text-light">{Math.round(data.hourly.temperature2m[i])}°</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 7 Day Forecast */}
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50 text-dark dark:text-light">7-Day Forecast</h3>
                      <div className="space-y-2 pb-4">
                        {data.daily.time.slice(0, 7).map((time, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-700 hover:bg-white/10 transition-colors">
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
                              <div className="w-24 h-1.5 bg-white rounded-full relative overflow-hidden">
                                <div 
                                  className="absolute h-full bg-green-200 rounded-full"
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

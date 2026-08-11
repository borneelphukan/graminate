import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import PlatformLayout from "@/layout/PlatformLayout";
import BeeIcon from "@/icons/BeeIcon";
import PoultryIcon from "@/icons/PoultryIcon";
import CattleIcon from "@/icons/CattleIcon";
import FlowerIcon from "@/icons/FlowerIcon";
import Head from "next/head";
import { Icon, Spinner, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@graminate/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import axios from "axios";
import axiosInstance from "@/lib/utils/axiosInstance";
import { triggerToast } from "@/stores/toast";

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
};

type AIServiceAdvisory = {
  name: string;
  relevantMetric: string;
  metricIcon: string;
  advisories: string[];
};

type AIResponseFormat = {
  services: AIServiceAdvisory[];
};

const DisasterManagement = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const { subTypes, language, plan, temperatureScale, city, timeFormat } = useUserPreferences();

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [aiAdvisories, setAiAdvisories] = useState<AIResponseFormat | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [addingTask, setAddingTask] = useState<string | null>(null);

  // Eagerly load cached AI advisories on mount
  useEffect(() => {
    if (!user_id) return;
    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id;
    const cacheKey = `ai_advisories_json_${userIdString}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (new Date().getTime() - parsed.timestamp < 3600000) {
          setAiAdvisories(parsed.data);
          setLastUpdated(new Date(parsed.timestamp));
        }
      } catch (e) {
        console.error("Failed to parse AI cache on mount:", e);
      }
    }
  }, [user_id]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/weather", {
          params: { lat, lon }
        });
        const newData = response.data;
        setWeatherData(newData);
        localStorage.setItem("weatherData_disaster", JSON.stringify({
          data: newData,
          lat,
          lon,
          timestamp: Date.now()
        }));
      } catch (err: any) {
        console.error("Failed to fetch weather:", err);
        setError("Failed to fetch current weather data.");
      } finally {
        setLoading(false);
      }
    };

    const getLocationAndFetch = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lon: longitude });
            fetchWeather(latitude, longitude);
          },
          async (err) => {
            console.warn("Geolocation error, trying fallback:", err);
            if (city) {
              const { getCoordsFromCity } = await import("@/lib/utils/loadWeather");
              const cityCoords = await getCoordsFromCity(city);
              if (cityCoords) {
                setCoords(cityCoords);
                fetchWeather(cityCoords.lat, cityCoords.lon);
                return;
              }
            }
            setError("Location access denied and no city fallback available.");
            setLoading(false);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
      }
    };

    const cached = localStorage.getItem("weatherData_disaster");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 2 * 60 * 1000) {
          setWeatherData(parsed.data);
          setCoords({ lat: parsed.lat, lon: parsed.lon });
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse weather cache");
      }
    }

    getLocationAndFetch();
  }, [city]);

  const fetchAIAdvisories = useCallback(async (force = false) => {
    if (!weatherData || subTypes.length === 0 || plan !== "PRO") return;

    const userIdString = Array.isArray(user_id) ? user_id[0] : user_id || "1";
    const cacheKey = `ai_advisories_json_${userIdString}`;

    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (new Date().getTime() - parsed.timestamp < 3600000) {
            setAiAdvisories(parsed.data);
            setLastUpdated(new Date(parsed.timestamp));
            return;
          }
        } catch (e) {
          console.error("Failed to parse AI cache:", e);
        }
      }
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      // Format temp based on scale preference for the prompt so AI uses correct units
      const tempVal = temperatureScale === "Fahrenheit"
        ? Math.round(weatherData.current.temperature2m * 1.8 + 32) + "°F"
        : Math.round(weatherData.current.temperature2m) + "°C";

      const prompt = `You are an agricultural expert assisting farmers. 
First, look at this exact live weather data: Temperature ${tempVal}, Wind ${weatherData.current.windSpeed10m.toFixed(1)} km/h, Precipitation ${weatherData.current.precipitation.toFixed(1)} mm, Humidity ${Math.round(weatherData.current.relativeHumidity2m)}%.
Farm services opted: ${subTypes.join(", ")}.

Based on the weather, provide 2 actionable agricultural precautionary measures per service to mitigate weather impacts. 
You MUST respond strictly in the following JSON format ONLY. DO NOT APOLOGIZE. DO NOT INCLUDE CONVERSATIONAL TEXT.
{
  "services": [
    {
      "name": "Poultry",
      "relevantMetric": "Temperature: ${tempVal}",
      "metricIcon": "thermostat",
      "advisories": ["Ensure proper ventilation..."]
    }
  ]
}
For metricIcon, choose the most relevant from: thermostat, air, umbrella, water_drop.
Language: ${language}.`;

      const response = await axiosInstance.post("/llm", {
        history: [{ sender: "user", text: prompt }],
        userId: userIdString,
        token: "internal",
      });

      let answer = response.data.answer;

      const firstBrace = answer.indexOf('{');
      const lastBrace = answer.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        answer = answer.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("No valid JSON found in AI response: " + answer);
      }

      const parsedJson = JSON.parse(answer) as AIResponseFormat;
      const timestamp = new Date().getTime();
      setAiAdvisories(parsedJson);
      setLastUpdated(new Date(timestamp));
      localStorage.setItem(cacheKey, JSON.stringify({
        data: parsedJson,
        timestamp,
      }));
    } catch (err) {
      console.error("AI fetch error or JSON parse error:", err);
      setAiError("Failed to fetch accurate advisories. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  }, [plan, language, temperatureScale, subTypes, weatherData, city, user_id]);

  const handleAddTask = async (serviceName: string, task: string, id: string) => {
    try {
      setAddingTask(id);
      await axiosInstance.post("/tasks/add", {
        user_id: parseInt(user_id as string, 10),
        project: serviceName,
        task,
        status: "To Do",
        priority: "High",
      });
      setAddingTask(`success-${id}`);
      triggerToast(`Task added to ${serviceName}`, "success");
      setTimeout(() => setAddingTask(null), 2000);
    } catch (e) {
      console.error("Failed to add task:", e);
      setAddingTask(`error-${id}`);
      triggerToast("Failed to add task. Please try again.", "error");
      setTimeout(() => setAddingTask(null), 2000);
    }
  };

  useEffect(() => {
    if (weatherData && subTypes.length > 0 && !aiAdvisories && !loadingAI && plan === "PRO" && !aiError) {
      fetchAIAdvisories();
    }
  }, [weatherData, subTypes, aiAdvisories, loadingAI, fetchAIAdvisories, plan, aiError]);

  return (
    <PlatformLayout>
      <Head>
        <title>Graminate | Disaster Management</title>
      </Head>
      <div className="min-h-screen container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-light">
              Disaster Management
            </h1>
            <p className="text-sm text-dark dark:text-light opacity-60">
              Prepare, monitor, and respond to agricultural hazards
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Weather Advisories Section */}
          <Accordion type="single" collapsible defaultValue="advisories" className="w-full">
            <AccordionItem value="advisories" className="border-none !border-b-0">
              <div className="flex items-center justify-between mb-4">
                <AccordionTrigger className="hover:bg-transparent !py-0 !px-0 flex-1 flex items-center gap-2 !font-bold text-xl text-dark dark:text-light justify-start [&_div]:!no-underline [&>i.material-symbols-outlined]:hidden group">
                  <div className="flex items-center gap-2 w-full text-left relative hover:cursor-pointer">
                    <Icon type="warning" className="text-yellow-500" />
                    Weather Advisories
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-4 z-10 relative">
                  {lastUpdated && plan === "PRO" && (
                    <span className="text-xs text-dark dark:text-light">
                      Updated at: {lastUpdated.toLocaleTimeString(language === "English" ? "en-US" : "en-IN", { hour: '2-digit', minute: '2-digit', hour12: timeFormat === "12-hour" })}
                    </span>
                  )}
                  {plan === "PRO" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAIAdvisories(true);
                      }}
                      disabled={loadingAI || loading}
                      variant="ghost"
                      icon={{ left: "refresh" }}
                      title="Refresh Advisories"
                    />
                  )}
                </div>
              </div>

              <AccordionContent className="!p-0 border-none">
                {/* AI Advisories Display */}
                {plan !== "PRO" ? (
                  <div className="p-10 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-800 flex flex-col items-center justify-center space-y-6 text-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 blur-2xl rounded-full animate-pulse opacity-40" />
                      <Icon type="workspace_premium" className="size-16 text-green-200 relative z-10" />
                    </div>
                    <div className="space-y-2 max-w-lg">
                      <h4 className="text-lg font-black uppercase tracking-widest text-dark dark:text-light">Pro Feature</h4>
                      <p className="text-sm text-dark dark:text-light opacity-60 leading-relaxed">
                        Upgrade to Graminate Pro to unlock hyper-local AI disaster management advisories tailored specifically to your farm's services and active weather conditions.
                      </p>
                    </div>
                    <Button
                      label="Upgrade Now"
                      variant="primary"
                      onClick={() => window.open(`/${user_id}/pricing`, '_blank')}
                    />
                  </div>
                ) : subTypes.length === 0 ? (
                  <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 flex items-start gap-3 mb-6">
                    <Icon type="info" className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">No Services Opted</p>
                      <p className="text-sm opacity-80 mt-1">Please add services (like Poultry, Cattle Rearing, etc.) to receive targeted weather advisories.</p>
                    </div>
                  </div>
                ) : aiAdvisories && aiAdvisories.services ? (
                  <div className="space-y-4 mb-6 relative">
                    {loadingAI && (
                      <div className="absolute -top-12 right-12 flex items-center gap-2 text-green-200">
                        <Spinner />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60 animate-pulse">Updating...</span>
                      </div>
                    )}
                    {loading && !loadingAI && (
                      <div className="absolute -top-12 right-12 flex items-center gap-2 text-dark dark:text-light opacity-40">
                        <Icon type="history" className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Cached Version</span>
                      </div>
                    )}

                    {aiAdvisories.services.map((service, idx) => (
                      <div key={idx} className="bg-white/5 border border-gray-400 dark:border-gray-800 rounded-xl p-4 transition-all duration-300 hover:bg-white/10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-black uppercase tracking-widest text-dark dark:text-light flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 text-green-200 shrink-0 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current">
                                {service.name.toLowerCase().includes("poultry") ? (
                                  <PoultryIcon />
                                ) : service.name.toLowerCase().includes("cattle") || service.name.toLowerCase().includes("animal") ? (
                                  <CattleIcon />
                                ) : service.name.toLowerCase().includes("api") || service.name.toLowerCase().includes("bee") ? (
                                  <BeeIcon />
                                ) : service.name.toLowerCase().includes("flora") || service.name.toLowerCase().includes("flower") ? (
                                  <FlowerIcon />
                                ) : (
                                  <Icon type="agriculture" className="text-green-200" />
                                )}
                              </div>
                              {service.name}
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {service.advisories.map((adv, i) => (
                                <li key={i} className="text-sm text-dark dark:text-light/90 marker:text-yellow-500 leading-relaxed font-medium group/adv relative pr-24 py-1">
                                  <span>{adv}</span>
                                  <div className={`absolute right-0 top-0 transition-all duration-300 ${
                                    addingTask?.includes(`${service.name}-${i}`) ? 'opacity-100' : 'opacity-0 group-hover/adv:opacity-100'
                                  }`}>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleAddTask(service.name, adv, `${service.name}-${i}`)}
                                      disabled={addingTask === `${service.name}-${i}` || addingTask === `success-${service.name}-${i}`}
                                      isLoading={addingTask === `${service.name}-${i}`}
                                      label={addingTask === `success-${service.name}-${i}` ? "Added" : addingTask === `error-${service.name}-${i}` ? "Error" : "Add to Task"}
                                      icon={{ left: addingTask === `success-${service.name}-${i}` ? "check" : addingTask === `error-${service.name}-${i}` ? "error" : "add_task" }}
                                    />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Highlight the weather condition that caused this advice adjacent to the service */}
                          <div className="shrink-0 md:border-l border-gray-400 dark:border-gray-700 md:pl-4 flex flex-col items-center justify-center min-w-[120px]">
                            <div className="size-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                              <Icon type={service.metricIcon || "explore"} className="size-5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-dark dark:text-light text-center">
                              Trigger Condition
                            </span>
                            <span className="text-base font-black text-dark dark:text-light text-center mt-1">
                              {service.relevantMetric}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : aiError ? (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-start gap-3 mb-6">
                    <Icon type="error" className="shrink-0 mt-0.5" />
                    <p>{aiError}</p>
                  </div>
                ) : loadingAI || loading ? (
                  <div className="p-10 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-800 flex flex-col items-center justify-center space-y-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 blur-xl rounded-full animate-pulse opacity-20" />
                      <Icon type="auto_awesome" className="size-10 text-yellow-500 relative z-10 animate-bounce" />
                    </div>
                    <p className="text-sm font-bold text-dark dark:text-light uppercase tracking-widest animate-pulse opacity-60">
                      {loading ? "Waiting for live weather data..." : "Analyzing weather & generating advisories..."}
                    </p>
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Additional Disaster Management sections */}
          <section className="opacity-50 pointer-events-none mt-10">
            <h2 className="text-xl font-bold text-dark dark:text-light mb-4">
              Emergency Contacts & SOPs
            </h2>
            <div className="p-6 bg-white/5 rounded-2xl border border-gray-400 dark:border-gray-800 text-center">
              <p className="text-dark dark:text-light">Coming Soon</p>
            </div>
          </section>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default DisasterManagement;

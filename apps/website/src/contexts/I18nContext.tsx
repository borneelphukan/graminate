import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import en from "../translations/en.json";
import hi from "../translations/hi.json";
import as from "../translations/as.json";
import de from "../translations/de.json";

interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<string, Translation> = { en, hi, as, de };

type Region = "India" | "Germany" | "Global";

interface I18nContextType {
  t: (key: string) => string;
  region: Region;
  setRegion: (region: Region) => void;
  availableLocales: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const REGION_LOCALES: Record<Region, string[]> = {
  India: ["en", "hi", "as"],
  Germany: ["en", "de"],
  Global: ["en"],
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locale, defaultLocale } = useRouter();
  const [region, setRegion] = useState<Region>("Global");

  // Robust auto-detection logic
  useEffect(() => {
    const detectRegion = async () => {
      const savedRegion = localStorage.getItem("selected-region") as Region;
      if (savedRegion) {
        setRegion(savedRegion);
        return;
      }

      try {
        // Try to detect via TimeZone first (very fast, no network)
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone.startsWith("Asia/Kolkata") || timeZone === "Asia/Calcutta") {
          updateRegion("India");
          return;
        }
        if (timeZone.startsWith("Europe/Berlin") || timeZone.startsWith("Europe/Busingen")) {
          updateRegion("Germany");
          return;
        }

        // Fallback to a fast GeoIP lookup if TimeZone is ambiguous
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_name === "India") {
          updateRegion("India");
        } else if (data.country_name === "Germany") {
          updateRegion("Germany");
        } else {
          updateRegion("Global");
        }
      } catch (error) {
        console.error("Region detection failed:", error);
        updateRegion("Global");
      }
    };

    detectRegion();
  }, []);

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: string | Translation = translations[locale || defaultLocale || "en"];
    for (const key of keys) {
      if (typeof current === "string" || !current[key]) return path;
      current = current[key];
    }
    return typeof current === "string" ? current : path;
  };

  const updateRegion = (newRegion: Region) => {
    setRegion(newRegion);
    localStorage.setItem("selected-region", newRegion);
  };

  const availableLocales = REGION_LOCALES[region];

  return (
    <I18nContext.Provider value={{ t, region, setRegion: updateRegion, availableLocales }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within an I18nProvider");
  return context;
};

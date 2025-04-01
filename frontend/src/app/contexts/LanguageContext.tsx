"use client";

import { createContext, useContext, useState } from "react";

type Language = "en" | "ja";

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getDefaultLanguage = (): Language => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language.startsWith("ja") ? "ja" : "en";
      return browserLang;
    }
    return "en";
  };

  const [language, setLanguage] = useState<Language>(getDefaultLanguage());

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ja" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

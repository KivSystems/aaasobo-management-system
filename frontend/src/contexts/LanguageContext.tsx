"use client";

import { createContext, useContext, useState } from "react";

interface LanguageContextProps {
  language: LanguageType;
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
  const [language, setLanguage] = useState<LanguageType>(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language.startsWith("ja") ? "ja" : "en";
    }
    return "en";
  });

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
    console.error(
      "Warning: useLanguage was called outside of a LanguageProvider.",
    );
    return { language: "en" as LanguageType, toggleLanguage: () => {} };
  }

  return context;
};

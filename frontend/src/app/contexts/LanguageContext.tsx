"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useState } from "react";

interface LanguageContextProps {
  language: LanguageType;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);
const Loading = dynamic(
  () => import("../components/elements/loading/Loading"),
  { ssr: false },
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<LanguageType | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.startsWith("ja") ? "ja" : "en";
    setLanguage(browserLang);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ja" : "en"));
  };

  if (language === null) {
    return <Loading />;
  }

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

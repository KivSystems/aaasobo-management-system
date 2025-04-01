"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import styles from "./LanguageSwitcher.module.scss";

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={styles.languageSwitcher} onClick={toggleLanguage}>
      <div
        className={`${styles.switch} ${language === "ja" ? styles.active : ""}`}
      ></div>
      <span>{language === "en" ? "EN" : "JA"}</span>
    </div>
  );
};

export default LanguageSwitcher;

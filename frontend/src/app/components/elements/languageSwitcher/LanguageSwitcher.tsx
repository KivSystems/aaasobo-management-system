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
      <span
        className={`${styles.language} ${language === "ja" && styles["language--active"]}`}
      >
        JP
      </span>
      <span
        className={`${styles.language} ${language === "en" && styles["language--active"]}`}
      >
        EN
      </span>
    </div>
  );
};

export default LanguageSwitcher;

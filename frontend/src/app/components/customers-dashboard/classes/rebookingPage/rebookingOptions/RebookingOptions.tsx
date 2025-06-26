"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookingOptions.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function RebookingOptions({
  selectOption,
}: {
  selectOption: (option: "instructor" | "dateTime") => void;
}) {
  const { language } = useLanguage();

  return (
    <div className={styles.rebookingOptions}>
      <ActionButton
        btnText={
          language === "ja"
            ? "インストラクターから予約"
            : "Book with Instructor"
        }
        className="rescheduleBtn"
        onClick={() => selectOption("instructor")}
      />

      <ActionButton
        btnText={language === "ja" ? "日時から予約" : "Book by Date & Time"}
        className="rescheduleBtn"
        onClick={() => selectOption("dateTime")}
      />
    </div>
  );
}

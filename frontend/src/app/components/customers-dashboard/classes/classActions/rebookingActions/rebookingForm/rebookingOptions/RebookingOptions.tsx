"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookingOptions.module.scss";

export default function RebookingOptions({
  selectOption,
  setRebookingStep,
  language,
}: RebookableOptionsProps) {
  return (
    <div className={styles.rebookingOptions}>
      <div className={styles.rebookingOptions__options}>
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

      <ActionButton
        btnText={language === "ja" ? "戻る" : "Back"}
        className="back"
        onClick={() => setRebookingStep("selectClass")}
      />
    </div>
  );
}

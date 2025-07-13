"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookingOptions.module.scss";

export default function RebookingOptions({
  selectOption,
  setRebookingStep,
  language,
  noInstructorAvailable,
}: RebookableOptionsProps) {
  return (
    <div className={styles.rebookingOptions}>
      {!noInstructorAvailable && (
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
      )}

      {noInstructorAvailable && (
        <p className={styles.noInstructorMessage}>
          {language === "ja"
            ? "予約可能なクラスがありません。"
            : "No classes available for booking."}
        </p>
      )}

      <ActionButton
        btnText={language === "ja" ? "戻る" : "Back"}
        className="back"
        onClick={() => setRebookingStep("selectClass")}
      />
    </div>
  );
}

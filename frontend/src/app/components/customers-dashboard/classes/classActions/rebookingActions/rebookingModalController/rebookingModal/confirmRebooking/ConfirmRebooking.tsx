"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./ConfirmRebooking.module.scss";

export default function ConfirmRebooking({
  setRebookingStep,
  classToRebook,
  language,
}: ConfirmRebookingProps) {
  return (
    <div className={styles.modal}>
      <h3>
        {language === "ja"
          ? `振替予約するクラス: ID ${classToRebook}`
          : `Class to Rebook: ID ${classToRebook}`}
      </h3>

      <div className={styles.modal__backBtn}>
        <ActionButton
          btnText={language === "ja" ? "戻る" : "Back"}
          className="back"
          onClick={() => setRebookingStep("selectOption")}
        />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookingOptions.module.scss";

export default function RebookingOptions({
  selectOption,
  setRebookingStep,
  language,
}: RebookableOptionsProps) {
  return (
    <div className={styles.rebookingOptions}>
      <div className={styles.rebookingOptions__optionsContainer}>
        <div className={styles.rebookingOptions__option}>
          <Image
            src={"/images/fa-solid_chalkboard-teacher.svg"}
            alt="chalkboard-teacher"
            width={100}
            height={100}
            className={styles.image}
            priority={true}
          />
          <ActionButton
            btnText={
              language === "ja"
                ? "インストラクターから予約"
                : "Book with Instructor"
            }
            className="rescheduleBtn"
            onClick={() => selectOption("instructor")}
          />
        </div>

        <div className={styles.rebookingOptions__option}>
          <Image
            src={"/images/fluent-mdl2_date-time.svg"}
            alt="chalkboard-teacher"
            width={100}
            height={100}
            className={styles.image}
            priority={true}
          />
          <ActionButton
            btnText={language === "ja" ? "日時から予約" : "Book by Date & Time"}
            className="rescheduleBtn"
            onClick={() => selectOption("dateTime")}
          />
        </div>
      </div>

      <ActionButton
        btnText={language === "ja" ? "戻る" : "Back"}
        className="back"
        onClick={() => setRebookingStep("selectClass")}
      />
    </div>
  );
}

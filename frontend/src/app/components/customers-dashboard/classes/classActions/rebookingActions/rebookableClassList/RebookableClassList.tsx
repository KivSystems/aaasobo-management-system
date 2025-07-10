"use client";

import React from "react";
import styles from "./RebookableClassList.module.scss";
import {
  formatShortDate,
  formatTime24Hour,
  nHoursBefore,
} from "@/app/helper/utils/dateUtils";
import { REBOOKING_TOO_LATE_NOTICE } from "@/app/helper/messages/customerDashboard";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";

export default function RebookableClassList({
  rebookableClasses,
  setClassToRebook,
  setRebookingStep,
  language,
}: RebookableClassListProps) {
  const handleRebook = (id: number, rebookableUntil: Date) => {
    const now = new Date().getTime();
    const rebookingDeadline = nHoursBefore(
      3,
      new Date(rebookableUntil),
    ).getTime();

    if (now > rebookingDeadline) {
      return alert(REBOOKING_TOO_LATE_NOTICE[language]);
    }

    setClassToRebook(id);
    setRebookingStep("selectOption");
  };

  return (
    <ul className={styles.modal__list}>
      {rebookableClasses?.map((classItem) => {
        const locale = language === "ja" ? "ja-JP" : "en-US";
        const date = formatShortDate(
          new Date(classItem.rebookableUntil),
          locale,
        );
        const time = formatTime24Hour(new Date(classItem.rebookableUntil));

        return (
          <li key={classItem.id} className={styles.listItem}>
            <div className={styles.listItem__dateTime}>
              {language === "ja" ? (
                <>
                  <span>{`${date} ${time}`}</span> のクラスまで振替可能
                </>
              ) : (
                <>
                  Rebookable until <span>{`${time}`}</span> class,{" "}
                  <span>{`${date}`}</span>
                </>
              )}
            </div>
            <div className={styles.listItem__classId}>
              {classItem.classCode}
            </div>
            <div className={styles.listItem__button}>
              <ActionButton
                className="selectRebookingClass"
                btnText={language === "ja" ? "振替予約" : "Rebook"}
                onClick={() =>
                  handleRebook(classItem.id, classItem.rebookableUntil)
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

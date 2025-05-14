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
  language,
  setRebookingStep,
  setClassToRebook,
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

    setRebookingStep("selectOption");
    setClassToRebook(id);
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
          // TODO: After updating the Class table, use 'originalId' instead of 'id' here
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
            {/* TODO: After updating the Class table, use 'originalId' instead of 'id' here */}
            <div className={styles.listItem__classId}>{classItem.id}</div>
            <div className={styles.listItem__button}>
              <ActionButton
                className="select"
                btnText={language === "ja" ? "選択" : "Select"}
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

"use client";

import React from "react";
import styles from "./RebookableClassList.module.scss";
import {
  formatShortDate,
  formatTime24Hour,
  nHoursBefore,
} from "@/app/helper/utils/dateUtils";
import {
  FREE_TRIAL_BOOKING_TOO_LATE_NOTICE,
  REBOOKING_TOO_LATE_NOTICE,
} from "@/app/helper/messages/customerDashboard";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { confirmAndDeclineFreeTrialClass } from "@/app/helper/utils/confirmAndDeclineFreeTrialClass";

export default function RebookableClassList({
  customerId,
  rebookableClasses,
  setClassToRebook,
  setRebookingStep,
  language,
  isAdminAuthenticated,
}: RebookableClassListProps) {
  const handleRebook = (
    id: number,
    rebookableUntil: Date,
    isFreeTrial: boolean,
  ) => {
    const now = new Date().getTime();

    const hoursBefore = isFreeTrial ? 72 : 3;
    const rebookingDeadline = nHoursBefore(
      hoursBefore,
      new Date(rebookableUntil),
    ).getTime();

    if (now > rebookingDeadline) {
      return alert(
        isFreeTrial
          ? FREE_TRIAL_BOOKING_TOO_LATE_NOTICE[language]
          : REBOOKING_TOO_LATE_NOTICE[language],
      );
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
        const isFreeTrial = classItem.isFreeTrial;

        const dateTimeText = <span>{`${date} ${time}`}</span>;
        const bookableDateTime =
          language === "ja" ? (
            <>
              {dateTimeText} のクラスまで{isFreeTrial ? "予約可能" : "振替可能"}
            </>
          ) : (
            <>
              {isFreeTrial ? "Bookable" : "Rebookable"} until{" "}
              <span>{`${time}`}</span> class, <span>{`${date}`}</span>
            </>
          );

        const btnText =
          language === "ja"
            ? isFreeTrial
              ? "予約"
              : "振替予約"
            : isFreeTrial
              ? "Book"
              : "Rebook";

        return (
          <li key={classItem.id} className={styles.listItem}>
            <div className={styles.listItem__dateTime}>
              <>
                {bookableDateTime}
                {isFreeTrial && (
                  <p className={styles.listItem__declineClass}>
                    {language === "ja" ? (
                      <>
                        ※ 無料トライアルが不要な方は、
                        <button
                          className={styles.listItem__link}
                          onClick={() =>
                            confirmAndDeclineFreeTrialClass({
                              customerId,
                              isAdminAuthenticated,
                              language,
                            })
                          }
                        >
                          こちら
                        </button>
                      </>
                    ) : (
                      <>
                        ※ If you don't need a free trial class,&nbsp;
                        <button
                          className={styles.listItem__link}
                          onClick={() =>
                            confirmAndDeclineFreeTrialClass({
                              customerId,
                              isAdminAuthenticated,
                              language,
                            })
                          }
                        >
                          click here
                        </button>
                        .
                      </>
                    )}
                  </p>
                )}
              </>
            </div>
            <div className={styles.listItem__classId}>
              <p>{classItem.classCode}</p>
              {isFreeTrial &&
                (language === "ja" ? (
                  <span>無料トライアル</span>
                ) : (
                  <span>Free Trial</span>
                ))}
            </div>
            <div className={styles.listItem__button}>
              <ActionButton
                className="selectRebookingClass"
                btnText={btnText}
                onClick={() =>
                  handleRebook(
                    classItem.id,
                    classItem.rebookableUntil,
                    classItem.isFreeTrial,
                  )
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

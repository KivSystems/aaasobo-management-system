"use client";

import styles from "./UserStatusSwitcher.module.scss";
import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { getLongMonth, nDaysLater } from "@/app/helper/utils/dateUtils";
import InputField from "@/app/components/elements/inputField/InputField";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { MIN_DAYS_TO_LEAVE } from "@/app/helper/data/data";

const UserStatusSwitcher = ({
  isEditing,
  leavingDate,
  onStatusChange,
}: {
  isEditing: boolean;
  leavingDate: string | null;
  onStatusChange: (status: UserStatus, date: string | null) => void;
}) => {
  const [userStatus, setUserStatus] = useState<UserStatus>(
    leavingDate !== null ? "leaving" : "active",
  );
  const [updatedLeavingDate, setUpdatedLeavingDate] = useState<string | null>(
    leavingDate ? leavingDate : null,
  );
  const [dateInfo, setDateInfo] = useState<{
    month: number;
    date: number;
    year: number;
    isPast: boolean;
  }>({
    month: 0,
    date: 0,
    year: 0,
    isPast: false,
  });
  const { language } = useLanguage();

  useEffect(() => {
    // Update user status and leaving date
    const newStatus = leavingDate ? "leaving" : "active";
    setUserStatus(newStatus);
    setUpdatedLeavingDate(leavingDate);

    // Set date info
    if (leavingDate) {
      const targetDate = new Date(leavingDate);
      const month = targetDate.getMonth();
      const date = targetDate.getDate();
      const year = targetDate.getFullYear();
      const isPast = targetDate < new Date();
      setDateInfo({ month, date, year, isPast });
    }
  }, [leavingDate]);

  useEffect(() => {
    onStatusChange(userStatus, updatedLeavingDate);
  }, [userStatus, updatedLeavingDate, onStatusChange]);

  return (
    <>
      {isEditing ? (
        <>
          <p className={styles.userStatus__text}>User Status</p>
          <div className={styles.switchContainer}>
            <div
              className={styles.userStatusSwitcher}
              onClick={() => {
                setUserStatus(userStatus === "active" ? "leaving" : "active");
              }}
            >
              <div
                className={`${styles.switch} ${
                  userStatus === "leaving" ? styles.leaving : ""
                }`}
              ></div>
              <span
                className={`${styles.status} ${
                  userStatus === "active" && styles["status--active"]
                }`}
              >
                Active
              </span>
              <span
                className={`${styles.status} ${
                  userStatus === "leaving" && styles["status--active"]
                }`}
              >
                Leaving
              </span>
            </div>
            {userStatus === "leaving" && (
              <InputField
                name="leavingDate"
                type="date"
                value={
                  updatedLeavingDate
                    ? new Date(updatedLeavingDate).toISOString().split("T")[0]
                    : ""
                }
                min={nDaysLater(MIN_DAYS_TO_LEAVE).toISOString().split("T")[0]}
                onChange={(e) => setUpdatedLeavingDate(e.target.value || null)}
                onKeyDown={(e) => e.preventDefault()} // Prevent date input from typing
                className={styles.leavingDate__inputField}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {leavingDate && !isNaN(new Date(leavingDate).getTime()) && (
            <div className={styles.userLeaving}>
              <ExclamationTriangleIcon className={styles.userLeaving__icon} />
              <p className={styles.userLeaving__text}>
                {language === "en"
                  ? `${dateInfo.isPast ? "Left" : "Leaving"} on ${getLongMonth(new Date(leavingDate))} ${dateInfo.date}, ${dateInfo.year}`
                  : `${dateInfo.year}年${dateInfo.month + 1}月${dateInfo.date}日${dateInfo.isPast ? "退会済み" : "退会予定"} `}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserStatusSwitcher;

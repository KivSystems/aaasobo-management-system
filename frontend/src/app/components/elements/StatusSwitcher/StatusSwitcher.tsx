"use client";

import styles from "./StatusSwitcher.module.scss";
import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { getLongMonth, nDaysLater } from "@/app/helper/utils/dateUtils";
import InputField from "@/app/components/elements/inputField/InputField";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { TWO_WEEKS_TO_LEAVE } from "@/app/helper/data/data";

const StatusSwitcher = ({
  isEditing,
  statusOptions,
  currentStatus,
  leavingDate,
  title,
  width = "180px",
  onStatusChange,
}: {
  isEditing: boolean;
  statusOptions: string[];
  currentStatus: string;
  leavingDate?: string | null;
  title: string;
  width?: string;
  onStatusChange: (status: string, date?: string | null) => void;
}) => {
  const [status, setStatus] = useState<string>(currentStatus);
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
  const capitalizeFirst = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const { language } = useLanguage();

  useEffect(() => {
    setUpdatedLeavingDate(leavingDate ? leavingDate : null);

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
    onStatusChange(status, updatedLeavingDate);
  }, [status, updatedLeavingDate, onStatusChange]);

  return (
    <>
      {isEditing ? (
        <>
          <p className={styles.userStatus__text}>{title}</p>
          <div className={styles.switchContainer}>
            <div
              className={styles.userStatusSwitcher}
              style={{ width: width }}
              onClick={() => {
                const currentIndex = statusOptions.indexOf(status);
                const nextIndex = (currentIndex + 1) % statusOptions.length;
                setStatus(statusOptions[nextIndex]);
              }}
            >
              <div
                className={`${styles.switch} ${
                  status === statusOptions[1] ? styles.leaving : ""
                }`}
              ></div>
              <span
                className={`${styles.status} ${
                  status === statusOptions[0] ? styles["status--active"] : ""
                }`}
              >
                {capitalizeFirst(statusOptions[0])}
              </span>
              <span
                className={`${styles.status} ${
                  status === statusOptions[1] ? styles["status--active"] : ""
                }`}
              >
                {capitalizeFirst(statusOptions[1])}
              </span>
            </div>

            {status === "Leaving" && (
              <>
                <InputField
                  name="leavingDate"
                  type="date"
                  value={
                    updatedLeavingDate
                      ? new Date(updatedLeavingDate).toISOString().split("T")[0]
                      : ""
                  }
                  min={
                    nDaysLater(TWO_WEEKS_TO_LEAVE).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setUpdatedLeavingDate(e.target.value || null)
                  }
                  onKeyDown={(e) => e.preventDefault()} // Prevent date input from typing
                  className={styles.leavingDate__inputField}
                />
                <span>(Japan Time)</span>
              </>
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
                  ? `${dateInfo.isPast ? "Left" : "Leaving"} on ${getLongMonth(new Date(leavingDate))} ${dateInfo.date}, ${dateInfo.year} (Japan Time)`
                  : `${dateInfo.year}年${dateInfo.month + 1}月${dateInfo.date}日${dateInfo.isPast ? "退会済み" : "退会予定"} (日本時間)`}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StatusSwitcher;

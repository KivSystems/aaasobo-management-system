"use client";

import styles from "./UserStatusSwitcher.module.scss";
import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { getLongMonth, nDaysLater } from "@/app/helper/utils/dateUtils";
import { useLanguage } from "@/app/contexts/LanguageContext";
import InputField from "@/app/components/elements/inputField/InputField";
import { MIN_DAYS_TO_INACTIVE } from "@/app/helper/data/data";

const UserStatusSwitcher = ({
  isEditing,
  inactiveDate,
  className,
}: {
  isEditing: boolean;
  inactiveDate: string | null;
  className?: string;
}) => {
  const [userStatus, setUserStatus] = useState<"active" | "inactive">(
    inactiveDate !== null ? "inactive" : "active",
  );
  const [updatedInactiveDate, setUpdatedInactiveDate] = useState<string | null>(
    inactiveDate ? inactiveDate : null,
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
    // Update user status and inactive date
    setUserStatus(inactiveDate ? "inactive" : "active");
    setUpdatedInactiveDate(inactiveDate);

    // Set date info
    if (inactiveDate) {
      const month = new Date(inactiveDate).getMonth();
      const date = new Date(inactiveDate).getDate();
      const year = new Date(inactiveDate).getFullYear();
      const isPast = new Date(inactiveDate) < new Date();
      setDateInfo({ month, date, year, isPast });
    }
  }, [inactiveDate]);

  return (
    <>
      {isEditing ? (
        <>
          <p
            className={
              className === "customer"
                ? styles.customerInactiveDate__text
                : styles.userStatus__text
            }
          >
            User Status
          </p>
          <div className={styles.switchContainer}>
            <div
              className={
                className === "customer"
                  ? styles.customerStatusSwitcher
                  : styles.userStatusSwitcher
              }
              onClick={() => {
                setUserStatus(userStatus === "active" ? "inactive" : "active");
              }}
            >
              <div
                className={`${styles.switch} ${
                  userStatus === "inactive" ? styles.inactive : ""
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
                  userStatus === "inactive" && styles["status--active"]
                }`}
              >
                Inactive
              </span>
            </div>
            {userStatus === "inactive" && (
              <InputField
                name="inactiveDate"
                type="date"
                value={
                  updatedInactiveDate
                    ? new Date(updatedInactiveDate).toISOString().split("T")[0]
                    : ""
                }
                min={
                  nDaysLater(MIN_DAYS_TO_INACTIVE).toISOString().split("T")[0]
                }
                onChange={(e) => setUpdatedInactiveDate(e.target.value || null)}
                className={
                  className === "customer"
                    ? styles.customerInactiveDate__inputField
                    : styles.inactiveDate__inputField
                }
              />
            )}
          </div>
        </>
      ) : (
        <>
          {inactiveDate && !isNaN(new Date(inactiveDate).getTime()) && (
            <div className={styles.userInactive}>
              <ExclamationTriangleIcon className={styles.userInactive__icon} />
              <p className={styles.userInactive__text}>
                {language === "en"
                  ? `Inactive ${dateInfo.isPast ? "since" : "from"} ${getLongMonth(new Date(inactiveDate))} ${dateInfo.date}, ${dateInfo.year}`
                  : `${dateInfo.year}年${dateInfo.month}月${dateInfo.date}日より活動休止${dateInfo.isPast ? "" : "予定"}`}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserStatusSwitcher;

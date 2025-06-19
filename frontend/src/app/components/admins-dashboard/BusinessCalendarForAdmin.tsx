"use client";

import { useState } from "react";
import styles from "./BusinessCalendarForAdmin.module.scss";
import Loading from "../elements/loading/Loading";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import BusinessCalendarClient from "./BusinessCalendarClient";

function BusinessCalendarForAdmin({
  isAdminAuthenticated,
}: {
  isAdminAuthenticated?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return <div>{error}</div>;
  }

  // Calculate the first day of the previous year (e.g., 20XX-01-01)
  const firstDayOfPreYear: string = (() => {
    const now = new Date();
    return new Date(now.getFullYear() - 1, 0, 2).toISOString().split("T")[0];
  })();
  const calendarValidRange = getValidRange(firstDayOfPreYear, 24);

  return (
    <div className={styles.calendarContainer}>
      {/* {isLoading && <Loading />} */}
      {error && <div>{error}</div>}
      {/* {!isLoading && !error && ( */}
      <>
        <BusinessCalendarClient
          validRange={calendarValidRange}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      </>
      {/* )} */}
    </div>
  );
}

export default BusinessCalendarForAdmin;

import React from "react";
import styles from "./ClassCalendar.module.scss";
import ClassActions from "./classActions/ClassActions";
import CustomerCalendar from "./customerCalensar/CustomerCalendar";
import { fetchClassesForCalendar } from "@/app/helper/api/classesApi";

export default async function ClassCalendar({
  customerId,
  isAdminAuthenticated,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
}) {
  // TODO: This fetch is temporary. Once CustomerCalendar is made a server component, the fetch and async should be removed
  const classes: ClassForCalendar[] | null = await fetchClassesForCalendar(
    customerId,
    "customer",
  );

  return (
    <main className={styles.calendarContainer}>
      <ClassActions
        isAdminAuthenticated={isAdminAuthenticated}
        customerId={customerId}
      />

      <CustomerCalendar
        customerId={customerId}
        isAdminAuthenticated={isAdminAuthenticated}
        classes={classes}
      />
    </main>
  );
}

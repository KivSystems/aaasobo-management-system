import React from "react";
import styles from "./ClassCalendar.module.scss";
import ClassActions from "./classActions/ClassActions";
import CustomerCalendar from "./customerCalensar/CustomerCalendar";
import { getClasses, getCustomerById } from "@/app/helper/api/customersApi";

export default async function ClassCalendar({
  customerId,
  isAdminAuthenticated,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
}) {
  const classes: CustomerClass[] | [] = await getClasses(customerId);
  const customer = await getCustomerById(customerId);
  const createdAt: string = customer.createdAt;

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
        createdAt={createdAt}
        // TODO: Fetch holidays from the backend
        // holidays={["2024-07-29", "2024-07-30", "2024-07-31"]}
      />
    </main>
  );
}

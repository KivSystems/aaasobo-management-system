import React from "react";
import styles from "./ClassCalendar.module.scss";
import ClassActions from "./classActions/ClassActions";
import CustomerCalendar from "./customerCalensar/CustomerCalendar";
import { getClasses, getCustomerById } from "@/app/helper/api/customersApi";
import WelcomeModalController from "./welcomeModalController/WelcomModalController";
import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";

export default async function ClassCalendar({
  customerId,
  isAdminAuthenticated,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
}) {
  const [classes, customer, schedule, events] = await Promise.all([
    getClasses(customerId),
    getCustomerById(customerId),
    getAllBusinessSchedules(),
    getAllEvents(),
  ]);

  const createdAt = customer.createdAt;
  const hasSeenWelcomeModal = customer.hasSeenWelcome;

  const colorsForEvents: { event: string; color: string }[] = events.map(
    (e: EventColor) => ({
      event: e.Event,
      color: e["Color Code"],
    }),
  );

  return (
    <main className={styles.calendarContainer}>
      <ClassActions
        isAdminAuthenticated={isAdminAuthenticated}
        customerId={customerId}
      />

      <CustomerCalendar
        customerId={customerId}
        classes={classes}
        createdAt={createdAt}
        businessSchedule={schedule.organizedData}
        colorsForEvents={colorsForEvents}
      />

      {!hasSeenWelcomeModal && (
        <WelcomeModalController
          isAdminAuthenticated={isAdminAuthenticated}
          customerId={customerId}
        />
      )}
    </main>
  );
}

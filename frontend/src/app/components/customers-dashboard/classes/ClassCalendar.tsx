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
import { getCookie } from "../../../../middleware";

export default async function ClassCalendar({
  customerId,
  userSessionType,
}: {
  customerId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  const [classes, customer, schedule, events] = await Promise.all([
    getClasses(customerId, cookie),
    getCustomerById(customerId, cookie),
    getAllBusinessSchedules(cookie),
    getAllEvents(cookie),
  ]);

  const createdAt = customer.createdAt;
  const hasSeenWelcomeModal = customer.hasSeenWelcome;
  const terminationAt = customer.terminationAt;

  const colorsForEvents: { event: string; color: string }[] = events.map(
    (e: EventColor) => ({
      event: e.Event,
      color: e["Color Code"],
    }),
  );

  return (
    <main className={styles.calendarContainer}>
      <ClassActions
        userSessionType={userSessionType}
        customerId={customerId}
        terminationAt={terminationAt}
      />

      <CustomerCalendar
        customerId={customerId}
        classes={classes}
        createdAt={createdAt}
        businessSchedule={schedule.organizedData}
        colorsForEvents={colorsForEvents}
        userSessionType={userSessionType}
      />

      {!hasSeenWelcomeModal && (
        <WelcomeModalController
          userSessionType={userSessionType}
          customerId={customerId}
        />
      )}
    </main>
  );
}

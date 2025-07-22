import styles from "./BusinessCalendarForAdmin.module.scss";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import BusinessCalendarClient from "./BusinessCalendarClient";

function BusinessCalendarForAdmin({
  businessSchedule,
  events,
  isAdminAuthenticated,
}: {
  businessSchedule: BusinessSchedule[];
  events: BusinessEventType[];
  isAdminAuthenticated?: boolean;
}) {
  // Calculate the first day of the previous year (e.g., 20XX-01-01)
  const now = new Date();
  const firstDayOfPreYear: string = ((currentDate: Date) => {
    return new Date(currentDate.getFullYear() - 1, 0, 2)
      .toISOString()
      .split("T")[0];
  })(now);
  // Calculate the valid range (from 1 year ago to 1 year later) for the calendar
  const calendarValidRange = getValidRange(
    firstDayOfPreYear,
    24 - now.getMonth(),
  );

  return (
    <div className={styles.calendarContainer}>
      <>
        <BusinessCalendarClient
          businessSchedule={businessSchedule}
          events={events}
          validRange={calendarValidRange}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      </>
    </div>
  );
}

export default BusinessCalendarForAdmin;

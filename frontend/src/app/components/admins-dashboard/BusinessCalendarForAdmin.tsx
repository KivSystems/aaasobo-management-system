import styles from "./BusinessCalendarForAdmin.module.scss";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import BusinessCalendarClient from "./BusinessCalendarClient";

function BusinessCalendarForAdmin({
  businessSchedule,
  isAdminAuthenticated,
}: {
  businessSchedule: BusinessSchedule[];
  isAdminAuthenticated?: boolean;
}) {
  // Calculate the first day of the previous year (e.g., 20XX-01-01)
  const firstDayOfPreYear: string = (() => {
    const now = new Date();
    return new Date(now.getFullYear() - 1, 0, 2).toISOString().split("T")[0];
  })();
  const calendarValidRange = getValidRange(firstDayOfPreYear, 24);

  return (
    <div className={styles.calendarContainer}>
      <>
        <BusinessCalendarClient
          businessSchedule={businessSchedule}
          validRange={calendarValidRange}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      </>
    </div>
  );
}

export default BusinessCalendarForAdmin;

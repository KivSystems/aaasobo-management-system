import {
  BusinessTime,
  Weekday,
  WEEKDAYS,
} from "@/app/helper/utils/scheduleUtils";
import styles from "./EditableScheduleCalendar.module.scss";

export function TimeColumn() {
  return (
    <div className={styles.timeColumn}>
      <p className={styles.header} />
      {BusinessTime.times.map((time) => (
        <div key={time} className={styles.time}>
          {time}
        </div>
      ))}
    </div>
  );
}

export function BaseDayColumn({
  day,
  children,
}: {
  day: Weekday;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.column}>
      <p className={styles.header}>{day}</p>
      {children}
    </div>
  );
}

export function BaseCalendarRoot({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}

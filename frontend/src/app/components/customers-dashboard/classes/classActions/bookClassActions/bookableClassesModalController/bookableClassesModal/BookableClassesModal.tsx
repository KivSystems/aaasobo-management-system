import styles from "./BookableClassesModal.module.scss";
import { formatFiveMonthsLaterEndOfMonth } from "@/app/helper/utils/dateUtils";

export default function BookableClassesModal({
  bookableClasses,
}: {
  bookableClasses: string[] | null;
}) {
  return (
    <div className={styles.modal}>
      <h2>Bookable Classes</h2>
      <ul className={styles.modal__list}>
        {bookableClasses?.map((classDateTime, index) => (
          <li key={index}>
            {index + 1} : until{" "}
            {formatFiveMonthsLaterEndOfMonth(classDateTime, "Asia/Tokyo")}
          </li>
        ))}
      </ul>
    </div>
  );
}

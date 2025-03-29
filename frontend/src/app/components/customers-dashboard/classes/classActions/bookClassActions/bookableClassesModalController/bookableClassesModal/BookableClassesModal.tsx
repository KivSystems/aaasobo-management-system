import styles from "./BookableClassesModal.module.scss";
import { formatEndOfMonthFiveMonthsLater } from "@/app/helper/utils/dateUtils";

export default function BookableClassesModal({
  bookableClasses,
}: {
  bookableClasses: string[] | null;
}) {
  return (
    <div className={styles.modal}>
      {/* TODO: Determine the language (jp or en) for the title based on context. */}
      <h2>Bookable Classes</h2>
      <ul className={styles.modal__list}>
        {bookableClasses?.map((classDateTime, index) => {
          // TODO: Determine the language (jp or en) for the locale based on context.
          const fiveMonthLaterDateTime = formatEndOfMonthFiveMonthsLater(
            classDateTime,
            "en-US",
          );
          return (
            <li key={index} className={styles.modal__listItem}>
              {/* TODO: Determine the language (jp or en) for the date based on context. */}
              {index + 1} : until{" "}
              <span>{`${fiveMonthLaterDateTime.time},
              ${fiveMonthLaterDateTime.date}`}</span>
              {/* {index + 1} :{" "}
              <span>
                {`${fiveMonthLaterDateTime.date} ${fiveMonthLaterDateTime.time}`}
              </span>
              まで予約可能。 */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

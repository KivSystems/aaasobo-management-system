import { useLanguage } from "@/app/contexts/LanguageContext";
import styles from "./BookableClassesModal.module.scss";
import { formatEndOfMonthFiveMonthsLater } from "@/app/helper/utils/dateUtils";

export default function BookableClassesModal({
  bookableClasses,
}: {
  bookableClasses: string[] | null;
}) {
  const { language } = useLanguage();

  return (
    <div className={styles.modal}>
      <h3>{language === "ja" ? "振替可能クラス" : "Bookable Classes"}</h3>

      <ul className={styles.modal__list}>
        {bookableClasses?.map((classDateTime, index) => {
          const fiveMonthLaterDateTime = formatEndOfMonthFiveMonthsLater(
            classDateTime,
            language === "ja" ? "ja-JP" : "en-US",
          );
          return (
            <li key={index} className={styles.modal__listItem}>
              {index + 1} :{" "}
              {language === "ja" ? (
                <>
                  <span>{`${fiveMonthLaterDateTime.date} ${fiveMonthLaterDateTime.time}`}</span>
                  まで振替可能。
                </>
              ) : (
                <>
                  until{" "}
                  <span>{`${fiveMonthLaterDateTime.time}, ${fiveMonthLaterDateTime.date}`}</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

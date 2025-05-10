import { useLanguage } from "@/app/contexts/LanguageContext";
import styles from "./RebookingModal.module.scss";
import {
  formatShortDate,
  formatTime24Hour,
  nHoursBefore,
} from "@/app/helper/utils/dateUtils";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import {
  REBOOKING_TOO_LATE_NOTICE,
  TODAYS_CLASS_BOOKING_NOTICE,
} from "@/app/helper/messages/customerDashboard";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

export default function RebookingModal({
  isAdminAuthenticated,
  customerId,
  rebookableClasses,
  setIsRebookingModalOpen,
}: {
  isAdminAuthenticated?: boolean;
  customerId: number;
  rebookableClasses: RebookableClass[] | [];
  setIsRebookingModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <div className={styles.modal}>
      <h3>
        {language === "ja"
          ? "振替予約するクラスをお選びください"
          : "Please select the class to book."}
      </h3>

      <ul className={styles.modal__list}>
        {rebookableClasses?.map((classItem, index) => {
          const locale = language === "ja" ? "ja-JP" : "en-US";
          const date = formatShortDate(
            new Date(classItem.rebookableUntil),
            locale,
          );
          const time = formatTime24Hour(new Date(classItem.rebookableUntil));

          const handleRebook = (id: number, rebookableUntil: Date) => {
            const now = new Date().getTime();
            const rebookingDeadline = nHoursBefore(
              3,
              new Date(rebookableUntil),
            ).getTime();
            const rebookingURL = isAdminAuthenticated
              ? `/admins/customer-list/${customerId}/classes/${id}/rebook`
              : `/customers/${customerId}/classes/${id}/rebook`;
            // const rebookingURL = isAdminAuthenticated
            //   ? `/admins/customer-list/${customerId}/classes/book`
            //   : `/customers/${customerId}/classes/book`;

            if (now > rebookingDeadline) {
              return alert(REBOOKING_TOO_LATE_NOTICE[language]);
            }

            router.push(rebookingURL);
          };

          return (
            <li key={index} className={styles.listItem}>
              <div className={styles.listItem__dateTime}>
                {index + 1} :{" "}
                {language === "ja" ? (
                  <>
                    <span>{`${date} ${time}`}</span> のクラスまで振替可能
                  </>
                ) : (
                  <>
                    Bookable until <span>{`${time}`}</span> class,{" "}
                    <span>{`${date}`}</span>
                  </>
                )}
              </div>
              <div className={styles.listItem__button}>
                <ActionButton
                  className="modalBookClass"
                  btnText={language === "ja" ? "振替予約" : "Book"}
                  onClick={() =>
                    handleRebook(classItem.id, classItem.rebookableUntil)
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      <InfoBanner info={TODAYS_CLASS_BOOKING_NOTICE[language]} />
      <div className={styles.modal__backBtn}>
        <ActionButton
          btnText={language === "ja" ? "戻る" : "Back"}
          className="back"
          onClick={() => setIsRebookingModalOpen(false)}
        />
      </div>
    </div>
  );
}

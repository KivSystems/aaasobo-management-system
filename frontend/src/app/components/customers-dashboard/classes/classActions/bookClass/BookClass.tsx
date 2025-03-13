import RedirectButton from "@/app/components/elements/buttons/redirectButton/RedirectButton";
import { ClassActionsProps } from "../ClassActions";
import styles from "./BookClass.module.scss";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/elements/modal/Modal";
import { formatFiveMonthsLaterEndOfMonth } from "@/app/helper/utils/dateUtils";

type BookClassProps = Pick<
  ClassActionsProps,
  | "rebookableClasses"
  | "setIsBookableClassesModalOpen"
  | "isAdminAuthenticated"
  | "customerId"
  | "isBookableClassesModalOpen"
>;

export default function BookClass({
  rebookableClasses,
  setIsBookableClassesModalOpen,
  isAdminAuthenticated,
  customerId,
  isBookableClassesModalOpen,
}: BookClassProps) {
  return (
    <>
      <div className={styles.calendarActions__booking}>
        <p
          onClick={() =>
            rebookableClasses &&
            rebookableClasses.length > 0 &&
            setIsBookableClassesModalOpen(true)
          }
          className={`${styles.bookableClasses} ${
            rebookableClasses && rebookableClasses.length > 0
              ? styles.clickable
              : ""
          }`}
        >
          Bookable Classes: {rebookableClasses?.length ?? 0}
        </p>

        {isAdminAuthenticated ? (
          <RedirectButton
            linkURL={`/admins/customer-list/${customerId}/classes/book`}
            btnText="Book Class"
            Icon={PlusIcon}
            className="bookClass"
            disabled={rebookableClasses?.length === 0}
          />
        ) : (
          <RedirectButton
            linkURL={`/customers/${customerId}/classes/book`}
            btnText="Book Class"
            Icon={PlusIcon}
            className="bookClass"
            disabled={rebookableClasses?.length === 0}
          />
        )}
      </div>

      <Modal
        isOpen={isBookableClassesModalOpen}
        onClose={() => setIsBookableClassesModalOpen(false)}
      >
        <div className={styles.modal}>
          <h2>Bookable Classes</h2>
          <ul className={styles.modal__list}>
            {rebookableClasses?.map((eachClass, index) => (
              <li key={eachClass.id}>
                {index + 1} : until{" "}
                {formatFiveMonthsLaterEndOfMonth(
                  eachClass.dateTime,
                  "Asia/Tokyo",
                )}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}

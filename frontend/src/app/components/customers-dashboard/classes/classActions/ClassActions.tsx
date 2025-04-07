import styles from "./ClassActions.module.scss";
import CancelClassesActions from "./cancelClassesActions/CancelClassesActions";
import BookClassActions from "./bookClassActions/BookClassActions";

export type ClassActionsProps = {
  isAdminAuthenticated?: boolean;
  customerId: number;
};

export default async function ClassActions({
  isAdminAuthenticated,
  customerId,
}: ClassActionsProps) {
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.calendarActions}>
        <div className={styles.calendarActions__container}>
          <CancelClassesActions
            customerId={customerId}
            isAdminAuthenticated={isAdminAuthenticated}
          />

          <BookClassActions
            customerId={customerId}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

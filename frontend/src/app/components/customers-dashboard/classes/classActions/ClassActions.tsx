import styles from "./ClassActions.module.scss";
import CancelClassesActions from "./cancelClassesActions/CancelClassesActions";
import RebookingActions from "./rebookingActions/RebookingActions";

export default async function ClassActions({
  isAdminAuthenticated,
  customerId,
}: {
  isAdminAuthenticated?: boolean;
  customerId: number;
}) {
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.calendarActions}>
        <div className={styles.calendarActions__container}>
          <CancelClassesActions
            customerId={customerId}
            isAdminAuthenticated={isAdminAuthenticated}
          />

          <RebookingActions
            customerId={customerId}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

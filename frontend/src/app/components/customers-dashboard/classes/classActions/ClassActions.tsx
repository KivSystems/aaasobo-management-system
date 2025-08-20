import styles from "./ClassActions.module.scss";
import CancelClassesActions from "./cancelClassesActions/CancelClassesActions";
import RebookingActions from "./rebookingActions/RebookingActions";

export default async function ClassActions({
  userSessionType,
  customerId,
}: {
  userSessionType: UserType;
  customerId: number;
}) {
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.calendarActions}>
        <div className={styles.calendarActions__container}>
          <CancelClassesActions
            customerId={customerId}
            userSessionType={userSessionType}
          />

          <RebookingActions
            customerId={customerId}
            userSessionType={userSessionType}
          />
        </div>
      </div>
    </div>
  );
}

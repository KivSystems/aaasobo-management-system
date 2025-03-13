import styles from "./ClassActions.module.scss";
import CancelClasses from "./cancelClasses/CancelClasses";
import BookClass from "./bookClass/BookClass";

export type ClassActionsProps = {
  setIsBookableClassesModalOpen: (open: boolean) => void;
  rebookableClasses?: { id: number; dateTime: string }[];
  isAdminAuthenticated?: boolean;
  customerId: number;
  classes: any;
  isBookableClassesModalOpen: boolean;
  fetchData: () => void;
  setError: (error: string) => void;
};

export default function ClassActions({
  setIsBookableClassesModalOpen,
  rebookableClasses,
  isAdminAuthenticated,
  customerId,
  isBookableClassesModalOpen,
  classes,
  fetchData,
  setError,
}: ClassActionsProps) {
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.calendarActions}>
        <div className={styles.calendarActions__container}>
          <CancelClasses
            classes={classes}
            customerId={customerId}
            fetchData={fetchData}
            setError={setError}
          />

          <BookClass
            rebookableClasses={rebookableClasses}
            customerId={customerId}
            isBookableClassesModalOpen={isBookableClassesModalOpen}
            setIsBookableClassesModalOpen={setIsBookableClassesModalOpen}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

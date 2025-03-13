import styles from "./ClassActions.module.scss";
import CancelClasses from "./cancelClasses/CancelClasses";
import BookClass from "./bookClass/BookClass";

export type ClassActionsProps = {
  setIsCancelingModalOpen: (open: boolean) => void;
  setIsBookableClassesModalOpen: (open: boolean) => void;
  rebookableClasses?: { id: number; dateTime: string }[];
  isAdminAuthenticated?: boolean;
  customerId: number;
  isCancelingModalOpen: boolean;
  handleCancelingModalClose: () => void;
  classes: any;
  selectedClasses: { classId: number; classDateTime: string }[];
  toggleSelectClass: (classId: number, classDateTime: string) => void;
  handleBulkCancel: () => Promise<void>;
  isBookableClassesModalOpen: boolean;
};

export default function ClassActions({
  setIsCancelingModalOpen,
  setIsBookableClassesModalOpen,
  rebookableClasses,
  isAdminAuthenticated,
  customerId,
  isCancelingModalOpen,
  isBookableClassesModalOpen,
  handleCancelingModalClose,
  classes,
  selectedClasses,
  toggleSelectClass,
  handleBulkCancel,
}: ClassActionsProps) {
  return (
    <div className={styles.calendarHeaderContainer}>
      <div className={styles.calendarActions}>
        <div className={styles.calendarActions__container}>
          <CancelClasses
            classes={classes}
            customerId={customerId}
            handleBulkCancel={handleBulkCancel}
            handleCancelingModalClose={handleCancelingModalClose}
            isCancelingModalOpen={isCancelingModalOpen}
            selectedClasses={selectedClasses}
            setIsCancelingModalOpen={setIsCancelingModalOpen}
            toggleSelectClass={toggleSelectClass}
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

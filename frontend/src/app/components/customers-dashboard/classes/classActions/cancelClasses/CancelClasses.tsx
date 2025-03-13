import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./CancelClasses.module.scss";
import Modal from "@/app/components/elements/modal/Modal";
import ClassesTable from "@/app/components/features/classesTable/ClassesTable";
import { ClassActionsProps } from "../ClassActions";

type CancelClassesProps = Pick<
  ClassActionsProps,
  | "setIsCancelingModalOpen"
  | "isCancelingModalOpen"
  | "handleCancelingModalClose"
  | "classes"
  | "selectedClasses"
  | "toggleSelectClass"
  | "handleBulkCancel"
  | "customerId"
>;

export default function CancelClasses({
  setIsCancelingModalOpen,
  isCancelingModalOpen,
  handleCancelingModalClose,
  classes,
  selectedClasses,
  toggleSelectClass,
  handleBulkCancel,
  customerId,
}: CancelClassesProps) {
  return (
    <div className={styles.calendarActions__canceling}>
      <ActionButton
        btnText="Cancel Classes"
        className="cancelClasses"
        onClick={() => setIsCancelingModalOpen(true)}
      />
      <Modal isOpen={isCancelingModalOpen} onClose={handleCancelingModalClose}>
        <div className={styles.modal}>
          <ClassesTable
            classes={classes}
            timeZone="Asia/Tokyo"
            selectedClasses={selectedClasses}
            toggleSelectClass={toggleSelectClass}
            handleBulkCancel={handleBulkCancel}
            userId={customerId}
            isAdminAuthenticated
            handleCancelingModalClose={handleCancelingModalClose}
          />
        </div>
      </Modal>
    </div>
  );
}

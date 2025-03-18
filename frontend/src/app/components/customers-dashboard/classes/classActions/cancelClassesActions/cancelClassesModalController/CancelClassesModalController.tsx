"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./CancelClassesModalController.module.scss";
import Modal from "@/app/components/elements/modal/Modal";
import ClassesTable from "@/app/components/features/classesTable/ClassesTable";
import { useState } from "react";
import { isPastPreviousDayDeadline } from "@/app/helper/utils/dateUtils";
import { cancelClass } from "@/app/helper/api/classesApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  revalidateBookableClasses,
  revalidateClassesForCalendar,
  revalidateCustomerCalendar,
} from "@/app/actions/revalidate";

export type CancelClassesModalControllerProps = {
  classes: ClassForCalendar[] | null;
  customerId: number;
};

export default function CancelClassesModalController({
  classes,
  customerId,
}: CancelClassesModalControllerProps) {
  const [selectedClasses, setSelectedClasses] = useState<
    { classId: number; classDateTime: string }[]
  >([]);
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);

  const handleCancelingModalClose = () => {
    setIsCancelingModalOpen(false);
    setSelectedClasses([]);
  };

  const handleBulkCancel = async () => {
    if (selectedClasses.length === 0) return;

    // Get classes that have passed the previous day cancelation deadline
    const pastPrevDayClasses = selectedClasses.filter((eachClass) =>
      isPastPreviousDayDeadline(eachClass.classDateTime, "Asia/Tokyo"),
    );

    if (pastPrevDayClasses.length > 0) {
      alert(
        "Classes cannot be canceled on or after the scheduled day of the class.",
      );
      const pastPrevDayClassIds = new Set(
        pastPrevDayClasses.map((pastClass) => pastClass.classId),
      );
      const updatedSelectedClasses = selectedClasses.filter(
        (eachClass) => !pastPrevDayClassIds.has(eachClass.classId),
      );
      return setSelectedClasses(updatedSelectedClasses);
    }

    // Get classes that are before the previous day's deadline
    const classesToCancel = selectedClasses.filter(
      (eachClass) =>
        !isPastPreviousDayDeadline(eachClass.classDateTime, "Asia/Tokyo"),
    );

    if (classesToCancel.length > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to cancel these ${selectedClasses.length} classes?`,
      );
      if (!confirmed) return handleCancelingModalClose();
      try {
        await Promise.all(
          classesToCancel.map((eachClass) => cancelClass(eachClass.classId)),
        );

        // Re-fetch data to update the state
        // fetchData();
        handleCancelingModalClose();

        toast.success("The classes have been successfully canceled!");

        // TODO: Revalidation should be done directly from a server component or API call
        await revalidateCustomerCalendar(customerId);
      } catch (error) {
        console.error("Failed to cancel classes:", error);
        // setError("Failed to cancel the classes. Please try again later.");
      }
    }
  };

  const toggleSelectClass = (classId: number, classDateTime: string) => {
    setSelectedClasses((prev) => {
      const updated = prev.filter((item) => item.classId !== classId);
      if (updated.length === prev.length) {
        updated.push({ classId, classDateTime });
      }
      return updated;
    });
  };

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

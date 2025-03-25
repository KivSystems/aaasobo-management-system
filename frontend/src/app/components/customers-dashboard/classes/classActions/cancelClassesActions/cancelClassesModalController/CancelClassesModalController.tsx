"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Modal from "@/app/components/elements/modal/Modal";
import ClassesTable from "@/app/components/features/classesTable/ClassesTable";
import { useState } from "react";

export default function CancelClassesModalController({
  upcomingClasses,
  customerId,
  isAdminAuthenticated,
}: CancelClassesModalControllerProps) {
  const [selectedClasses, setSelectedClasses] = useState<
    { classId: number; classDateTime: string }[]
  >([]);
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);

  const handleCancelingModalClose = () => {
    setIsCancelingModalOpen(false);
    setSelectedClasses([]);
  };

  return (
    <>
      <ActionButton
        btnText="Cancel Classes"
        className="cancelClasses"
        onClick={() => {
          setIsCancelingModalOpen(true);
        }}
      />
      <Modal isOpen={isCancelingModalOpen} onClose={handleCancelingModalClose}>
        <ClassesTable
          upcomingClasses={upcomingClasses}
          selectedClasses={selectedClasses}
          setSelectedClasses={setSelectedClasses}
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          handleCancelingModalClose={handleCancelingModalClose}
        />
      </Modal>
    </>
  );
}

"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import CancelClassesModal from "./cancelClassesModal/CancelClassesModal";

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
    <>
      <ActionButton
        btnText="Cancel Classes"
        className="cancelClasses"
        onClick={() => {
          setIsCancelingModalOpen(true);
        }}
      />
      <Modal isOpen={isCancelingModalOpen} onClose={handleCancelingModalClose}>
        <CancelClassesModal
          upcomingClasses={upcomingClasses}
          selectedClasses={selectedClasses}
          setSelectedClasses={setSelectedClasses}
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          handleCancelingModalClose={handleCancelingModalClose}
          toggleSelectClass={toggleSelectClass}
        />
      </Modal>
    </>
  );
}

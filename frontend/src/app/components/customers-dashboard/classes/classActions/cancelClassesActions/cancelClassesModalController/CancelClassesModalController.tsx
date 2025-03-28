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
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);

  return (
    <>
      {/* TODO: Determine the language (jp or en) for the btnText based on context. */}
      <ActionButton
        btnText="Cancel Classes"
        className="cancelClasses"
        onClick={() => {
          setIsCancelingModalOpen(true);
        }}
      />
      <Modal
        isOpen={isCancelingModalOpen}
        onClose={() => setIsCancelingModalOpen(false)}
      >
        <CancelClassesModal
          upcomingClasses={upcomingClasses}
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          isCancelingModalOpen={isCancelingModalOpen}
          setIsCancelingModalOpen={setIsCancelingModalOpen}
        />
      </Modal>
    </>
  );
}

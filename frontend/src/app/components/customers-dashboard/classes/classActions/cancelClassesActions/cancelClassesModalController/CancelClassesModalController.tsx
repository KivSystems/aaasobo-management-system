"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import CancelClassesModal from "./cancelClassesModal/CancelClassesModal";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function CancelClassesModalController({
  upcomingClasses,
  customerId,
  isAdminAuthenticated,
}: CancelClassesModalControllerProps) {
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <ActionButton
        btnText={language === "ja" ? "予約をキャンセル" : "Cancel Classes"}
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

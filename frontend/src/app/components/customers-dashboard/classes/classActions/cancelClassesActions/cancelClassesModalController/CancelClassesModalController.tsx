"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import CancelClassesModal from "./cancelClassesModal/CancelClassesModal";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function CancelClassesModalController({
  upcomingClasses,
  customerId,
  userSessionType,
  terminationAt,
}: CancelClassesModalControllerProps) {
  const [isCancelingModalOpen, setIsCancelingModalOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {userSessionType === "admin" || !terminationAt ? (
        <ActionButton
          btnText={language === "ja" ? "予約をキャンセル" : "Cancel Classes"}
          className="cancelClasses"
          onClick={() => {
            setIsCancelingModalOpen(true);
          }}
          disabled={upcomingClasses.length === 0}
        />
      ) : null}
      <Modal
        isOpen={isCancelingModalOpen}
        onClose={() => setIsCancelingModalOpen(false)}
      >
        <CancelClassesModal
          upcomingClasses={upcomingClasses}
          customerId={customerId}
          userSessionType={userSessionType}
          isCancelingModalOpen={isCancelingModalOpen}
          setIsCancelingModalOpen={setIsCancelingModalOpen}
        />
      </Modal>
    </>
  );
}

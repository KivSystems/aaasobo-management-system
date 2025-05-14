"use client";

import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import RebookingModal from "./rebookingModal/RebookingModal";
import { CHILD_PROFILE_REQUIRED_MESSAGE } from "@/app/helper/messages/customerDashboard";

export default function RebookingModalController({
  isAdminAuthenticated,
  customerId,
  rebookableClasses,
  hasChildProfile,
}: RebookingModalControllerProps) {
  const { language } = useLanguage();
  const [isRebookingModalOpen, setIsRebookingModalOpen] = useState(false);
  const rebookableClassesNumber = rebookableClasses.length;

  const handleRebookingClick = () => {
    if (!hasChildProfile)
      return alert(CHILD_PROFILE_REQUIRED_MESSAGE[language]);
    setIsRebookingModalOpen(true);
  };

  return (
    <>
      <ActionButton
        btnText={
          language === "ja"
            ? `振替予約 ${rebookableClassesNumber > 0 ? `(${rebookableClassesNumber})` : ""}`
            : `Rebook Class ${rebookableClassesNumber > 0 ? `(${rebookableClassesNumber})` : ""}`
        }
        className="rebookClass"
        onClick={handleRebookingClick}
        disabled={rebookableClassesNumber === 0}
      />
      <Modal
        isOpen={isRebookingModalOpen}
        onClose={() => setIsRebookingModalOpen(false)}
      >
        <RebookingModal
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          rebookableClasses={rebookableClasses}
          setIsRebookingModalOpen={setIsRebookingModalOpen}
        />
      </Modal>
    </>
  );
}

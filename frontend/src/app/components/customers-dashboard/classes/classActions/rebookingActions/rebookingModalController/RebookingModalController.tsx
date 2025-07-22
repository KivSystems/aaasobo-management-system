"use client";

import Modal from "@/app/components/elements/modal/Modal";
import { useState } from "react";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { CHILD_PROFILE_REQUIRED_MESSAGE } from "@/app/helper/messages/customerDashboard";

export default function RebookingModalController({
  rebookableClasses,
  hasChildProfile,
  modalContent,
}: RebookingModalControllerProps) {
  const { language } = useLanguage();
  const [isRebookingModalOpen, setIsRebookingModalOpen] = useState(false);
  const rebookableClassesNumber = rebookableClasses.length;

  const hasFreeTrial =
    rebookableClassesNumber > 0 &&
    rebookableClasses.some((classItem) => classItem.isFreeTrial === true);

  const handleRebookingClick = () => {
    if (!hasChildProfile)
      return alert(CHILD_PROFILE_REQUIRED_MESSAGE[language]);
    setIsRebookingModalOpen(true);
  };

  const buttonText =
    language === "ja"
      ? hasFreeTrial
        ? `クラスを予約${rebookableClassesNumber > 0 ? ` (${rebookableClassesNumber})` : ""}`
        : `振替予約${rebookableClassesNumber > 0 ? ` (${rebookableClassesNumber})` : ""}`
      : hasFreeTrial
        ? `Book Class${rebookableClassesNumber > 0 ? ` (${rebookableClassesNumber})` : ""}`
        : `Rebook Class${rebookableClassesNumber > 0 ? ` (${rebookableClassesNumber})` : ""}`;

  return (
    <>
      <ActionButton
        btnText={buttonText}
        className="rebookClass"
        onClick={handleRebookingClick}
        disabled={rebookableClassesNumber === 0}
      />
      <Modal
        isOpen={isRebookingModalOpen}
        onClose={() => setIsRebookingModalOpen(false)}
        className="rebooking"
      >
        {modalContent}
      </Modal>
    </>
  );
}

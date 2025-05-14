"use client";

import styles from "./RebookingModal.module.scss";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import ConfirmRebooking from "./confirmRebooking/ConfirmRebooking";
import SelectRebookingClass from "./selectRebookingClass/SelectRebookingClass";
import SelectRebookingOption from "./selectRebookingOption/SelectRebookingOption";

export default function RebookingModal({
  isAdminAuthenticated,
  customerId,
  rebookableClasses,
  setIsRebookingModalOpen,
}: RebookingModalProps) {
  const { language } = useLanguage();
  const [rebookingStep, setRebookingStep] =
    useState<RebookingStep>("selectClass");
  const [classToRebook, setClassToRebook] = useState<number | null>(null);

  const getSlideClass = () => {
    switch (rebookingStep) {
      case "selectClass":
        return "slide0";
      case "selectOption":
        return "slide1";
      case "confirmRebooking":
        return "slide2";
    }
  };

  return (
    <div className={styles.modal}>
      <div className={`${styles.slider} ${styles[getSlideClass()]}`}>
        <SelectRebookingClass
          rebookableClasses={rebookableClasses}
          setIsRebookingModalOpen={setIsRebookingModalOpen}
          setRebookingStep={setRebookingStep}
          setClassToRebook={setClassToRebook}
          language={language}
        />
        <SelectRebookingOption
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          setRebookingStep={setRebookingStep}
          classToRebook={classToRebook}
          language={language}
        />
        <ConfirmRebooking
          setRebookingStep={setRebookingStep}
          classToRebook={classToRebook}
          language={language}
        />
      </div>
    </div>
  );
}

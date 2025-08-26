"use client";

import Modal from "@/app/components/elements/modal/Modal";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useState } from "react";
import WelcomeModal from "./WelcomeModa";

export default function WelcomeModalController({
  customerId,
  userSessionType,
}: {
  customerId: number;
  userSessionType: UserType;
}) {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const { language } = useLanguage();

  return (
    <Modal isOpen={isWelcomeModalOpen} className="welcomeModal">
      <WelcomeModal
        customerId={customerId}
        setIsWelcomeModalOpen={setIsWelcomeModalOpen}
        language={language}
        userSessionType={userSessionType}
      />
    </Modal>
  );
}

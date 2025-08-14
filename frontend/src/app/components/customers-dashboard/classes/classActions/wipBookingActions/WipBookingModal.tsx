"use client";

import Modal from "@/app/components/elements/modal/Modal";
import ProgressiveBookingFlow from "./ProgressiveBookingFlow";

interface WipBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  isFreeTrial: boolean;
  language: LanguageType;
  classCode?: string;
  childProfiles: Child[];
  customerId: number;
}

export default function WipBookingModal({
  isOpen,
  onClose,
  classId,
  isFreeTrial,
  language,
  classCode,
  childProfiles,
  customerId,
}: WipBookingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="wipBooking">
      <ProgressiveBookingFlow
        classId={classId}
        isFreeTrial={isFreeTrial}
        language={language}
        onClose={onClose}
        classCode={classCode}
        childProfiles={childProfiles}
        customerId={customerId}
      />
    </Modal>
  );
}

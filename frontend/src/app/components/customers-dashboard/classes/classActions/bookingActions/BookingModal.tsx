"use client";

import Modal from "@/app/components/elements/modal/Modal";
import ProgressiveBookingFlow from "./ProgressiveBookingFlow";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  isFreeTrial: boolean;
  language: LanguageType;
  classCode?: string;
  childProfiles: Child[];
  customerId: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  classId,
  isFreeTrial,
  language,
  classCode,
  childProfiles,
  customerId,
}: BookingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="booking">
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

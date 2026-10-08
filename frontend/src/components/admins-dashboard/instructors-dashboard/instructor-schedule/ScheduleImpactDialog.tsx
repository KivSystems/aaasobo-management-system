"use client";

import { useLanguage } from "@/contexts/LanguageContext";

import Modal from "@/components/elements/modal/Modal";
import type { ScheduleUpdateImpactSummary } from "@shared/schemas/instructors";
import styles from "./ScheduleImpactDialog.module.scss";

interface ScheduleImpactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  impactSummary: ScheduleUpdateImpactSummary | null;
}

export default function ScheduleImpactDialog({
  isOpen,
  onClose,
  impactSummary,
}: ScheduleImpactDialogProps) {
  const { language } = useLanguage();
  if (!impactSummary) {
    return null;
  }

  const { canceledClassCount, terminatedRecurringClassCount } = impactSummary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} overlayClosable={true}>
      <div className={styles.content}>
        <h3 className={styles.title}>
          {language === "ja"
            ? "スケジュール変更の結果"
            : "Schedule Update Impact"}
        </h3>
        <p className={styles.description}>
          {language === "ja"
            ? "スケジュール変更に伴い、以下の予約を変更しました。"
            : "This schedule update affected existing bookings."}
        </p>
        <ul className={styles.impactList}>
          {terminatedRecurringClassCount > 0 && (
            <li>
              {language === "ja"
                ? `${terminatedRecurringClassCount}件のレギュラークラスを終了しました。`
                : `${terminatedRecurringClassCount} regular ${terminatedRecurringClassCount === 1 ? "class was" : "classes were"} terminated.`}
            </li>
          )}
          {canceledClassCount > 0 && (
            <li>
              {language === "ja"
                ? `${canceledClassCount}件の予約済みクラスを講師都合でキャンセルしました。`
                : `${canceledClassCount} booked ${canceledClassCount === 1 ? "class was" : "classes were"} canceled by the instructor.`}
            </li>
          )}
        </ul>
        <p className={styles.note}>
          {language === "ja"
            ? "キャンセルされたクラスは通常の手順で振替予約できます。"
            : "Canceled classes remain available for the existing rebooking flow."}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}

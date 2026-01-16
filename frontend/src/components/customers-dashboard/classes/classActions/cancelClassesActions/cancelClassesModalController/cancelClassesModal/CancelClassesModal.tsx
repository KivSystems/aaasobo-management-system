import styles from "./CancelClassesModal.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelSelectedClasses } from "@/app/actions/cancelSelectedClasses";
import {
  CONFIRM_CLASS_CANCELLATION,
  NO_CANCELABLE_CLASSES_MESSAGE,
} from "@/lib/messages/customerDashboard";
import { isPastPreviousDayDeadline } from "@/lib/utils/dateUtils";
import ActionButton from "@/components/elements/buttons/actionButton/ActionButton";
import Table from "@/components/elements/table/Table";
import UpcomingClasses from "./upcomingClasses/UpcomingClasses";
import InfoBanner from "@/components/elements/infoBanner/InfoBanner";
import { useState } from "react";
import { validateCancelableClasses } from "@/lib/utils/validationUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import SameDayCancellationNotice from "@/components/features/classDetail/sameDayCancellationNotice/SameDayCancellationNotice";
import { errorAlert, confirmAlert } from "@/lib/utils/alertUtils";

export default function CancelClassesModal({
  upcomingClasses,
  customerId,
  userSessionType,
  isCancelingModalOpen,
  setIsCancelingModalOpen,
}: CancelClassesModalProps) {
  const [selectedClasses, setSelectedClasses] = useState<
    { classId: number; classDateTime: string }[]
  >([]);
  const { language } = useLanguage();

  const handleBulkCancel = async () => {
    if (selectedClasses.length === 0) return;

    // Validation: exclude classes that have passed the previous day's cancellation deadline.
    if (
      !validateCancelableClasses(selectedClasses, setSelectedClasses, language)
    )
      return;

    const confirmed = await confirmAlert(CONFIRM_CLASS_CANCELLATION[language]);
    if (!confirmed) return setIsCancelingModalOpen(false);

    const classesToCancel = selectedClasses.map(
      (classItem) => classItem.classId,
    );

    const cancelationResult = await cancelSelectedClasses(
      classesToCancel,
      customerId,
      userSessionType,
    );

    if (!cancelationResult.success)
      return errorAlert(cancelationResult.message[language]);

    setIsCancelingModalOpen(false);

    toast.success(cancelationResult.message[language]);
  };

  const showSameDayCancelNotice = upcomingClasses.some(({ dateTime }) =>
    isPastPreviousDayDeadline(dateTime),
  );

  return (
    <div className={styles.modalWrapper}>
      <div className={styles.modalContent}>
        {upcomingClasses.length > 0 ? (
          <>
            <Table
              className="cancelClasses"
              headItems={
                language === "ja"
                  ? ["", "日付", "時間", "インストラクター", "　お子さま"]
                  : ["", "Date", "Time", "Instructor", "Children"]
              }
            >
              <UpcomingClasses
                upcomingClasses={upcomingClasses}
                selectedClasses={selectedClasses}
                setSelectedClasses={setSelectedClasses}
                isCancelingModalOpen={isCancelingModalOpen}
              />
            </Table>

            {showSameDayCancelNotice && (
              <InfoBanner
                info={<SameDayCancellationNotice language={language} />}
              />
            )}
          </>
        ) : (
          <h3 style={{ textAlign: "center" }}>
            {NO_CANCELABLE_CLASSES_MESSAGE[language]}
          </h3>
        )}

        <div className={styles.classesTable__buttons}>
          <ActionButton
            onClick={handleBulkCancel}
            disabled={selectedClasses.length === 0}
            btnText={`${language === "ja" ? "予約をキャンセル" : "Cancel Classes"}${selectedClasses.length > 0 ? ` (${selectedClasses.length})` : ""}`}
            className="cancelSelectedClasses"
          />
        </div>
      </div>
    </div>
  );
}

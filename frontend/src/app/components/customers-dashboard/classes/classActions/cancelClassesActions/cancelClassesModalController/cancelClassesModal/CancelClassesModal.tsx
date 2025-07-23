import styles from "./CancelClassesModal.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelSelectedClasses } from "@/app/actions/cancelSelectedClasses";
import {
  CONFIRM_CLASS_CANCELLATION,
  NO_CANCELABLE_CLASSES_MESSAGE,
} from "@/app/helper/messages/customerDashboard";
import { isPastPreviousDayDeadline } from "@/app/helper/utils/dateUtils";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Table from "@/app/components/elements/table/Table";
import UpcomingClasses from "./upcomingClasses/UpcomingClasses";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import { useState } from "react";
import { validateCancelableClasses } from "@/app/helper/utils/validationUtils";
import { useLanguage } from "@/app/contexts/LanguageContext";
import SameDayCancellationNotice from "@/app/components/features/classDetail/sameDayCancellationNotice/SameDayCancellationNotice";

export default function CancelClassesModal({
  upcomingClasses,
  customerId,
  isAdminAuthenticated,
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

    const confirmed = window.confirm(CONFIRM_CLASS_CANCELLATION[language]);
    if (!confirmed) return setIsCancelingModalOpen(false);

    const classesToCancel = selectedClasses.map(
      (classItem) => classItem.classId,
    );

    const cancelationResult = await cancelSelectedClasses(
      classesToCancel,
      isAdminAuthenticated,
      customerId,
    );

    if (!cancelationResult.success)
      return alert(cancelationResult.message[language]);

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

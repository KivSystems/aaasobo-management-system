import styles from "./CancelClassesModal.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cancelSelectedClasses } from "@/app/actions/cancelSelectedClasses";
import {
  CONFIRM_CLASS_CANCELLATION,
  FAILED_TO_CANCEL_CLASSES,
  NO_CANCELABLE_CLASSES_MESSAGE,
  SELECTED_CLASSES_CANCELLATION_SUCCESS,
  TODAYS_CLASS_CANCELLATION_NOTICE,
} from "@/app/helper/messages/customerDashboard";
import { isPastPreviousDayDeadline } from "@/app/helper/utils/dateUtils";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import Table from "@/app/components/elements/table/Table";
import UpcomingClasses from "./upcomingClasses/UpcomingClasses";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import { useState } from "react";
import { validateCancelableClasses } from "@/app/helper/utils/validationUtils";
import { useLanguage } from "@/app/contexts/LanguageContext";

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
    ) {
      return;
    }

    const confirmed = window.confirm(
      language === "ja"
        ? CONFIRM_CLASS_CANCELLATION.ja
        : CONFIRM_CLASS_CANCELLATION.en,
    );
    if (!confirmed) return setIsCancelingModalOpen(false);

    const classesToCancel = selectedClasses.map(
      (classItem) => classItem.classId,
    );

    try {
      await cancelSelectedClasses(
        classesToCancel,
        isAdminAuthenticated,
        customerId,
      );

      setIsCancelingModalOpen(false);
      toast.success(
        language === "ja"
          ? SELECTED_CLASSES_CANCELLATION_SUCCESS.ja
          : SELECTED_CLASSES_CANCELLATION_SUCCESS.en,
      );
    } catch (error) {
      alert(
        language === "ja"
          ? FAILED_TO_CANCEL_CLASSES.ja
          : FAILED_TO_CANCEL_CLASSES.en,
      );
    }
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
                  ? ["", "日付", "時間", "インストラクター", "お子様"]
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
                info={
                  language === "ja"
                    ? TODAYS_CLASS_CANCELLATION_NOTICE.ja
                    : TODAYS_CLASS_CANCELLATION_NOTICE.en
                }
              />
            )}
          </>
        ) : (
          <h3 style={{ textAlign: "center" }}>
            {language === "ja"
              ? NO_CANCELABLE_CLASSES_MESSAGE.ja
              : NO_CANCELABLE_CLASSES_MESSAGE.en}
          </h3>
        )}

        <div className={styles.classesTable__buttons}>
          <ActionButton
            btnText={language === "ja" ? "戻る" : "Back"}
            className="back"
            onClick={() => setIsCancelingModalOpen(false)}
          />
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

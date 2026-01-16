import { CheckCircleIcon } from "@heroicons/react/24/solid";
import styles from "./RebookingCompleteMessage.module.scss";
import { REBOOK_CLASS_RESULT_MESSAGES } from "@/lib/messages/customerDashboard";
import ActionButton from "@/components/elements/buttons/actionButton/ActionButton";

const RebookingCompleteMessage = ({
  rebookableClassesNumber,
  setRebookingStep,
  language,
}: RebookingCompleteMessageProps) => {
  const hasRebookableClasses = rebookableClassesNumber > 0;

  const BOOKABLE_CLASSES_NUMBER =
    language === "ja"
      ? "現在の予約可能クラス数"
      : "Current number of bookable classes";

  return (
    <div className={styles.rebookingComplete}>
      <CheckCircleIcon className={styles.rebookingComplete__icon} />
      <h1>{REBOOK_CLASS_RESULT_MESSAGES.success[language]}</h1>

      {hasRebookableClasses && (
        <>
          <p>{`${BOOKABLE_CLASSES_NUMBER}：${rebookableClassesNumber}`}</p>

          <ActionButton
            btnText={
              language === "ja" ? "続けて予約する" : "Book Another Class"
            }
            className="bookBtn"
            onClick={() => setRebookingStep("selectClass")}
          />
        </>
      )}
    </div>
  );
};

export default RebookingCompleteMessage;

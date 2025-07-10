import { CheckCircleIcon } from "@heroicons/react/24/solid";
import styles from "./RebookingCompleteMessage.module.scss";
import { REBOOK_CLASS_RESULT_MESSAGES } from "@/app/helper/messages/customerDashboard";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";

const RebookingCompleteMessage = ({
  rebookableClassesNumber,
  setRebookingStep,
  language,
}: RebookingCompleteMessageProps) => {
  const hasRebookableClasses = rebookableClassesNumber > 0;

  return (
    <div className={styles.rebookingComplete}>
      <CheckCircleIcon className={styles.rebookingComplete__icon} />
      <h1>{REBOOK_CLASS_RESULT_MESSAGES.success[language]}</h1>

      {hasRebookableClasses && (
        <>
          <p>{`現在の振替可能クラス数：${rebookableClassesNumber}`}</p>

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

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import styles from "./RebookingCompleteMessage.module.scss";
import { REBOOK_CLASS_RESULT_MESSAGES } from "@/app/helper/messages/customerDashboard";
import { useLanguage } from "@/app/contexts/LanguageContext";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";

const RebookingCompleteMessage = ({
  rebookableClasses,
  setRebookingStep,
}: {
  rebookableClasses: RebookableClass[] | [];
  setRebookingStep: (step: RebookingSteps) => void;
}) => {
  const { language } = useLanguage();
  const rebookableClassesNumber = rebookableClasses.length;
  const hasRebookableClasses = rebookableClassesNumber > 0;

  return (
    <div className={styles.complete}>
      <CheckCircleIcon className={styles.complete__icon} />
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

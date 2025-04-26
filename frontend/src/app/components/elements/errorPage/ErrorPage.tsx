import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import styles from "./ErrorPage.module.scss";
import {
  ERROR_PAGE_MESSAGE_EN,
  ERROR_PAGE_MESSAGE_JP,
} from "@/app/helper/messages/generalMessages";
import ActionButton from "../buttons/actionButton/ActionButton";

export default function ErrorPage({
  reset,
  errorMessages,
  language,
}: {
  reset: () => void;
  errorMessages?: { messageEn: string; messageJa: string };
  language?: LanguageType;
}) {
  return (
    <main className={styles.errorContainer}>
      <ExclamationTriangleIcon className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>
        {language === "ja"
          ? errorMessages?.messageJa || ERROR_PAGE_MESSAGE_JP
          : errorMessages?.messageEn || ERROR_PAGE_MESSAGE_EN}
      </h2>
      <ActionButton
        className="addBtn"
        btnText={language === "ja" ? "もう一度試す" : "Try again"}
        onClick={() => reset()}
      />
    </main>
  );
}

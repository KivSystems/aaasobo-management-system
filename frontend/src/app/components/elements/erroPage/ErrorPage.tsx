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
  lng,
}: {
  reset: () => void;
  errorMessages?: { messageEn: string; messageJa: string };
  lng: "en" | "ja";
}) {
  return (
    <main className={styles.errorContainer}>
      <ExclamationTriangleIcon className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>
        {lng === "ja"
          ? errorMessages?.messageJa || ERROR_PAGE_MESSAGE_JP
          : errorMessages?.messageEn || ERROR_PAGE_MESSAGE_EN}
      </h2>
      <ActionButton
        className="addBtn"
        btnText="Try again"
        onClick={() => reset()}
      />
    </main>
  );
}

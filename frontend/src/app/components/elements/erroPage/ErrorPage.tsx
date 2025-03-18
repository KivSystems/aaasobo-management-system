import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import styles from "./ErrorPage.module.scss";
import { ERROR_PAGE_MESSAGE } from "@/app/helper/messages/generalMessages";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className={styles.errorContainer}>
      <ExclamationTriangleIcon className={styles.errorIcon} />
      <h2 className={styles.errorTitle}>{ERROR_PAGE_MESSAGE}</h2>
      <button className={styles.retryButton} onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import styles from "./FormValidationMessage.module.scss";
import { CONTACT_EMAIL, LINE_QR_CODE_URL } from "@/lib/data/contacts";

type MessageProps = {
  type: "error" | "success";
  message: string;
  className?: string;
};

export default function FormValidationMessage({
  type,
  message,
  className = "",
}: MessageProps) {
  const isError = type === "error";
  const Icon = isError ? ExclamationTriangleIcon : CheckCircleIcon;

  const shouldShowContactInfo =
    isError &&
    (message.includes("スタッフまでご連絡") ||
      message.toLowerCase().includes("contact us"));

  return (
    <div
      className={`${styles.message}  ${isError ? styles["message--error"] : styles["message--success"]} ${className && styles[className]} ${shouldShowContactInfo && styles.withContactInfo}`}
    >
      <Icon
        className={`${styles.icon} ${isError ? styles["icon--error"] : styles["icon--success"]}`}
      />

      <p className={isError ? styles.errorText : styles.successText}>
        {message}
      </p>

      {shouldShowContactInfo && (
        <div className={styles.contacts}>
          <p className={styles.contacts__mail}>
            <span>mail: </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={styles.contacts__link}
              style={{ textDecoration: "underline" }}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className={styles.contacts__line}>
            <span>LINE: </span>
            <a
              href={LINE_QR_CODE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contacts__link}
              style={{ textDecoration: "underline" }}
            >
              {LINE_QR_CODE_URL}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

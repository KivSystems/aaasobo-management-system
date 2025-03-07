import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import styles from "./FormValidationMessage.module.scss";

type MessageProps = {
  type: "error" | "success";
  message: string;
};

export default function FormValidationMessage({ type, message }: MessageProps) {
  const isError = type === "error";
  const Icon = isError ? ExclamationTriangleIcon : CheckCircleIcon;

  return (
    <div className={styles.message}>
      <Icon
        className={`${styles.icon} ${isError ? styles["icon--error"] : styles["icon--success"]}`}
      />
      <p className={isError ? styles.errorText : styles.successText}>
        {message}
      </p>
    </div>
  );
}

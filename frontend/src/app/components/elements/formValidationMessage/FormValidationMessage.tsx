import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import styles from "./FormValidationMessage.module.scss";

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

  return (
    <div
      className={`${styles.message}  ${isError ? styles["message--error"] : styles["message--success"]} ${className ? styles[className] : ""}`}
    >
      <Icon
        className={`${styles.icon} ${isError ? styles["icon--error"] : styles["icon--success"]}`}
      />
      <p className={isError ? styles.errorText : styles.successText}>
        {message}
      </p>
    </div>
  );
}

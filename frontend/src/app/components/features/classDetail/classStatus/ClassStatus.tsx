import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import styles from "./ClassStatus.module.scss";

const ClassStatus = ({
  status,
  language,
}: {
  status: string;
  language?: LanguageType;
}) => {
  const languageClass = language === "ja" ? styles.ja : styles.en;

  const renderIcon = () => {
    if (status === "booked" || status === "completed") {
      return (
        <CheckCircleIcon
          className={`${styles.classStatus__icon} ${styles[status]}`}
        />
      );
    }
    if (status === "canceledByInstructor") {
      return (
        <ExclamationTriangleIcon
          className={`${styles.classStatus__icon} ${styles[status]}`}
        />
      );
    }
    return (
      <XCircleIcon
        className={`${styles.classStatus__icon} ${styles[status]}`}
      />
    );
  };

  const renderStatusLabel = () => {
    switch (status) {
      case "booked":
        return language === "ja" ? "レギュラークラス" : "Regular Class";
      case "rebooked":
        return language === "ja" ? "振替クラス" : "Rebooked Class";
      case "completed":
        return language === "ja" ? "終了" : "Completed";
      case "canceledByCustomer":
        return language === "ja" ? "キャンセル" : "Canceled";
      case "canceledByInstructor":
        return language === "ja" ? "キャンセル" : "Canceled by Instructor";
      default:
        return language === "ja" ? "不明なクラス" : "Unknown Status";
    }
  };

  return (
    <div className={styles.classStatus}>
      {renderIcon()}
      <div className={`${styles.classStatus__label} ${languageClass}`}>
        {renderStatusLabel()}
        {status === "canceledByInstructor" && language === "ja" && (
          <span>（インストラクター都合）</span>
        )}
      </div>
    </div>
  );
};

export default ClassStatus;

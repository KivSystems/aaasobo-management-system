import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import styles from "./PasswordStrengthMeter.module.scss";

export default function PasswordStrengthMeter({
  password,
  passwordStrength,
  language,
}: {
  password: string;
  passwordStrength: number | null;
  language?: LanguageType;
}) {
  const strengthLabels =
    language === "ja"
      ? ["低い", "高い", "とても高い"]
      : ["Weak", "Good!", "Very Good!"];
  const strengthColors = ["#FF3E3E", "#A0D468", "#4CAF50"];
  const strengthBarWidths = ["20%", "60%", "100%"];
  const mappedStrength =
    passwordStrength === null
      ? 0
      : passwordStrength < 3
        ? 0
        : passwordStrength === 3
          ? 1
          : 2;

  return (
    <div>
      {/* Strength Label */}
      <p className={styles.strengthLabel}>
        {language === "ja" ? "パスワードの安全性" : "Strength"}:{" "}
        <span>
          {password && passwordStrength !== null ? (
            passwordStrength >= 3 ? (
              <CheckCircleIcon
                className={`${styles.strengthLabel__icon} ${styles["strengthLabel__icon--check"]}`}
              />
            ) : (
              <XCircleIcon
                className={`${styles.strengthLabel__icon} ${styles["strengthLabel__icon--x"]}`}
              />
            )
          ) : (
            ""
          )}
        </span>
        <span>
          {password && passwordStrength !== null
            ? strengthLabels[mappedStrength]
            : ""}
        </span>
      </p>

      {/* Strength Bar */}
      <div className={styles.strengthBarContainer}>
        <div
          className={styles.strengthBar}
          style={{
            width:
              password && passwordStrength !== null
                ? strengthBarWidths[mappedStrength]
                : "0",
            backgroundColor: password
              ? strengthColors[mappedStrength]
              : "transparent",
          }}
        />
      </div>

      <div className={styles.passwordFeedback}>
        {password && passwordStrength !== null && passwordStrength < 3
          ? language === "ja"
            ? "数字・記号・アルファベットを組み合わせると、不正アクセスを防ぎやすくなります。"
            : "Mixing numbers, symbols, and letters improves security."
          : ""}
      </div>
    </div>
  );
}

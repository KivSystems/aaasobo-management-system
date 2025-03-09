import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import styles from "./PasswordStrengthMeter.module.scss";

export default function PasswordStrengthMeter({
  password,
  passwordStrength,
  passwordFeedback,
}: {
  password: string;
  passwordStrength: number;
  passwordFeedback: string;
}) {
  const strengthLabels = ["Weak", "Good!", "Very Good!"];
  const strengthColors = ["#FF3E3E", "#A0D468", "#4CAF50"];
  const strengthBarWidths = ["20%", "60%", "100%"];
  const mappedStrength =
    passwordStrength < 3 ? 0 : passwordStrength === 3 ? 1 : 2;

  return (
    <div>
      {/* Strength Label */}
      <p className={styles.strengthLabel}>
        Strength:{" "}
        <span>
          {password ? (
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
        <span>{password ? strengthLabels[mappedStrength] : ""}</span>
      </p>

      {/* Strength Bar */}
      <div className={styles.strengthBarContainer}>
        <div
          className={styles.strengthBar}
          style={{
            width: password ? strengthBarWidths[mappedStrength] : "0",
            backgroundColor: password
              ? strengthColors[mappedStrength]
              : "transparent",
          }}
        />
      </div>

      {/* Password Feedback */}
      <div className={styles.passwordFeedback}>
        {passwordFeedback ? <p>{passwordFeedback}</p> : ""}
      </div>
    </div>
  );
}

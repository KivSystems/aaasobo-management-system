import CheckboxInput from "@/app/components/elements/checkboxInput/CheckboxInput";
import styles from "./PrivacyPolicyAgreement.module.scss";

const PrivacyPolicyAgreement = ({
  localMessages,
}: {
  localMessages: Record<string, string>;
}) => {
  return (
    <div>
      <label className={styles.label}>
        Privacy Policy
        <span className={styles.required}>*</span>
        <p className={styles.privacyPolicy}>
          We will take a screenshot as a record that the class was conducted.
          Additionally, we may record the session for the purpose of improving
          the instructor&apos;s skills.
        </p>
      </label>

      <CheckboxInput
        name="isAgreed"
        label="I agree."
        error={localMessages.isAgreed}
      />
    </div>
  );
};

export default PrivacyPolicyAgreement;

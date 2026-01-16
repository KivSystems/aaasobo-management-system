import CheckboxInput from "@/components/elements/checkboxInput/CheckboxInput";
import styles from "./PrivacyPolicyAgreement.module.scss";
import { ChangeEvent } from "react";
import FormValidationMessage from "@/components/elements/formValidationMessage/FormValidationMessage";

const PrivacyPolicyAgreement = ({
  error,
  onChange,
  checked,
  language,
}: {
  error: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  language: LanguageType;
}) => {
  return (
    <div>
      <label className={styles.label}>
        {language === "ja" ? "個人情報の取扱いについて" : "Privacy Policy"}
        <p className={styles.privacyPolicy}>
          {language === "ja"
            ? "クラスが行われた記録としてスクリーンショットを一枚お撮りします。またインストラクターの技術向上のためあらかじめ録画させていただく場合がございます。"
            : "We will take a screenshot as a record that the class was conducted. Additionally, we may record the session for the purpose of improving the instructor's skills."}
        </p>
      </label>

      <CheckboxInput
        label={language === "ja" ? "同意する" : "I agree."}
        onChange={onChange}
        checked={checked}
        className="isAgreed"
      />

      {error && <FormValidationMessage type="error" message={error} />}
    </div>
  );
};

export default PrivacyPolicyAgreement;

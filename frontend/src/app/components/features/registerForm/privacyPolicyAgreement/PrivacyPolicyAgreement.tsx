import CheckboxInput from "@/app/components/elements/checkboxInput/CheckboxInput";
import styles from "./PrivacyPolicyAgreement.module.scss";

const PrivacyPolicyAgreement = ({
  localMessages,
  language,
}: {
  localMessages: Record<string, string>;
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
        name="isAgreed"
        label={language === "ja" ? "同意する" : "I agree."}
        error={localMessages.isAgreed}
      />
    </div>
  );
};

export default PrivacyPolicyAgreement;

"use client";

import Link from "next/link";
import styles from "./EmailVerificationForm.module.scss";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmailVerificationForm = ({
  resultMessage,
}: {
  resultMessage: {
    success?: { ja: string; en: string };
    error?: { ja: string; en: string };
  };
}) => {
  const { language } = useLanguage();

  return (
    <div className={styles.verificationForm}>
      <h2 className={styles.verificationForm__title}>
        {language === "ja" ? "メールアドレスの認証" : "Email Verification"}
      </h2>

      {resultMessage.success && (
        <FormValidationMessage
          type="success"
          message={resultMessage.success[language]}
        />
      )}

      {resultMessage.error && (
        <FormValidationMessage
          type="error"
          message={resultMessage.error[language]}
        />
      )}

      <Link
        className={styles.verificationForm__loginLink}
        href={"/customers/login"}
      >
        {language === "ja" ? "ログイン" : "Login"}
      </Link>
    </div>
  );
};

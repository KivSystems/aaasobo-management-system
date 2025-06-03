"use client";

import React, { useState } from "react";
import styles from "./ResetPasswordForm.module.scss";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import Link from "next/link";
import { useInput } from "@/app/hooks/useInput";
import { usePasswordStrength } from "@/app/hooks/usePasswordStrength";
import PasswordStrengthMeter from "../../elements/passwordStrengthMeter/PasswordStrengthMeter";
import { resetPassword } from "@/app/actions/resetPassword";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function ResetPasswordForm({
  token,
  userType,
  tokenVerificationResult,
}: ResetPasswordFormProps) {
  const [password, onPasswordChange] = useInput();
  const [showPassword, setShowPassword] = useState(false);
  const { passwordStrength } = usePasswordStrength(password);

  const [resultState, formAction] = useFormState(resetPassword, undefined);

  const { localMessages, clearErrorMessage } = useFormMessages(resultState);

  const isError = !!localMessages.errorMessage;
  const isErrorWithLink =
    !!localMessages.errorMessageWithResetLink ||
    !!tokenVerificationResult.needsResetLink;
  const isSuccess = !!localMessages.successMessage;

  const { language } = useLanguage();

  return !tokenVerificationResult.valid ? (
    <>
      <h2 className={styles.title}>
        {language === "ja" ? "無効なリンクです" : "Invalid reset link"}
      </h2>

      <div className={styles.messageWrapper}>
        <FormValidationMessage
          type="error"
          message={tokenVerificationResult.message[language]}
        />
      </div>
      {isErrorWithLink && (
        <Link
          className={styles.link}
          href={
            userType === "customer"
              ? "/auth/forgot-password?type=customer"
              : "/auth/forgot-password?type=instructor"
          }
        >
          {language === "ja" ? "リンクを再発行" : "Request link"}
        </Link>
      )}
    </>
  ) : (
    <>
      <h2 className={styles.title}>
        {language === "ja" ? "パスワードを再設定" : "Reset Your Password"}
      </h2>

      <form action={formAction} className={styles.form}>
        <TextInput
          id="password"
          label={language === "ja" ? "新しいパスワード" : "New Password"}
          type="password"
          name="password"
          value={password}
          placeholder={
            language === "ja" ? "8文字以上" : "At least 8 characters"
          }
          onChange={(event) => {
            onPasswordChange(event);
            clearErrorMessage("password");
          }}
          icon={<LockClosedIcon className={styles.icon} />}
          required={true}
          minLength={8}
          error={localMessages.password}
          showPassword={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
        />
        <PasswordStrengthMeter
          password={password}
          passwordStrength={passwordStrength}
          language={language}
        />
        <TextInput
          id="passConfirmation"
          type="password"
          name="passConfirmation"
          required
          placeholder={
            language === "ja" ? "パスワード再入力" : "Re-enter password"
          }
          icon={<LockClosedIcon className={styles.icon} />}
          error={localMessages.passConfirmation}
          onChange={() => clearErrorMessage("passConfirmation")}
          showPassword={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
          language={language}
        />

        {/* Hidden inputs to send necessary data with form submission. */}
        <input
          type="hidden"
          name="passwordStrength"
          value={passwordStrength ?? ""}
        />
        <input type="hidden" name="userType" value={userType ?? ""} />
        <input type="hidden" name="token" value={token ?? ""} />
        <input type="hidden" name="language" value={language ?? "en"} />

        <div className={styles.buttonWrapper}>
          <ActionButton
            btnText={language === "ja" ? "送 信" : "Submit"}
            className="submitBtn"
            type="submit"
          />
        </div>

        <div className={styles.messageWrapper}>
          {(isError || isErrorWithLink || isSuccess) && (
            <FormValidationMessage
              type={isSuccess ? "success" : "error"}
              message={
                isError
                  ? localMessages.errorMessage
                  : isErrorWithLink
                    ? localMessages.errorMessageWithResetLink
                    : localMessages.successMessage
              }
            />
          )}
        </div>

        {(isErrorWithLink || isSuccess) && (
          <Link
            className={styles.link}
            href={
              isErrorWithLink
                ? userType === "customer"
                  ? "/auth/forgot-password?type=customer"
                  : "/auth/forgot-password?type=instructor"
                : userType === "customer"
                  ? "/customers/login"
                  : "/instructors/login"
            }
          >
            {isErrorWithLink
              ? language === "ja"
                ? "リンクを再発行"
                : "Request link"
              : language === "ja"
                ? "ログイン"
                : "Login"}
          </Link>
        )}
      </form>
    </>
  );
}

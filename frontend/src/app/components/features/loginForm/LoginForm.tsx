"use client";

import React, { useState } from "react";
import styles from "./LoginForm.module.scss";
import { authenticate } from "@/app/actions/authActions";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import Link from "next/link";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

export default function LoginForm({
  userType,
  language,
}: {
  userType: UserType;
  language: LanguageType;
}) {
  const [errorState, formAction] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const { localMessages, clearErrorMessage } = useFormMessages(errorState);

  return (
    <form action={formAction} className={styles.form}>
      <TextInput
        id="email"
        type="email"
        name="email"
        placeholder={language === "ja" ? "メール" : "e-mail"}
        icon={<EnvelopeIcon className={styles.icon} />}
        required={true}
        onChange={() => clearErrorMessage("message")}
      />

      <TextInput
        id="password"
        type="password"
        name="password"
        placeholder={language === "ja" ? "パスワード" : "password"}
        icon={<LockClosedIcon className={styles.icon} />}
        required={true}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
        onChange={() => clearErrorMessage("message")}
        language={language}
      />

      {/* Hidden input to send necessary data with form submission. */}
      <input type="hidden" name="userType" value={userType ?? ""} />
      <input type="hidden" name="language" value={language ?? "en"} />

      <Link
        className={styles.resetLink}
        href={`/auth/forgot-password?type=${userType}`}
      >
        {language === "ja" ? "パスワードを忘れた場合" : "Forgot Password?"}
      </Link>

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText={language === "ja" ? "ログイン" : "Login"}
          className="bookBtn"
          type="submit"
        />
      </div>

      <div className={styles.errorWrapper}>
        {localMessages.errorMessage && (
          <FormValidationMessage
            type="error"
            message={localMessages.errorMessage}
          />
        )}
      </div>
    </form>
  );
}

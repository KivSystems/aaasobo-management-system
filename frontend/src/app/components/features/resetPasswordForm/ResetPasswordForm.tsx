"use client";

import React, { useState } from "react";
import styles from "./ResetPasswordForm.module.scss";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInput } from "@/app/hooks/useInput";
import { usePasswordStrength } from "@/app/hooks/usePasswordStrength";
import PasswordStrengthMeter from "../../elements/passwordStrengthMeter/PasswordStrengthMeter";
import { resetPassword } from "@/app/actions/resetPassword";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

export default function ResetPasswordForm() {
  const [password, onPasswordChange] = useInput();
  const [showPassword, setShowPassword] = useState(false);
  const { passwordStrength, passwordFeedback } = usePasswordStrength(password);

  const [resultState, formAction] = useFormState(resetPassword, undefined);

  const { localMessages, clearErrorMessage } = useFormMessages(resultState);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userType = searchParams.get("type") as UserType;

  return (
    <form action={formAction} className={styles.form}>
      <TextInput
        id="password"
        label="New Password"
        type="password"
        name="password"
        value={password}
        placeholder="At least 8 characters"
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
        passwordFeedback={passwordFeedback}
      />
      <TextInput
        id="passwordConfirmation"
        label="Password Confirmation"
        type="password"
        name="passwordConfirmation"
        placeholder="Re-enter your password"
        icon={<LockClosedIcon className={styles.icon} />}
        required={true}
        error={localMessages.passwordConfirmation}
        onChange={() => clearErrorMessage("passwordConfirmation")}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
      />

      {/* Hidden inputs to send necessary data with form submission. */}
      <input
        type="hidden"
        name="passwordStrength"
        value={passwordStrength ?? ""}
      />
      <input type="hidden" name="userType" value={userType ?? ""} />
      <input type="hidden" name="token" value={token ?? ""} />

      <div className={styles.buttonWrapper}>
        <ActionButton btnText="Submit" className="bookBtn" type="submit" />
      </div>

      <div className={styles.messageWrapper}>
        {localMessages.queryError && (
          <FormValidationMessage
            type="error"
            message={localMessages.queryError}
          />
        )}
        {localMessages.errorMessage && (
          <FormValidationMessage
            type="error"
            message={localMessages.errorMessage}
          />
        )}
        {localMessages.successMessage && (
          <FormValidationMessage
            type="success"
            message={localMessages.successMessage}
          />
        )}
      </div>

      {localMessages.queryError ? (
        <Link
          className={styles.passResetLink}
          href={
            userType === "customer"
              ? "/auth/forgot-password?type=customer"
              : "/auth/forgot-password?type=instructor"
          }
        >
          Request password reset link
        </Link>
      ) : (
        <Link
          className={styles.loginLink}
          href={
            userType === "customer" ? "/customers/login" : "/instructors/login"
          }
        >
          Return to login page
        </Link>
      )}
    </form>
  );
}

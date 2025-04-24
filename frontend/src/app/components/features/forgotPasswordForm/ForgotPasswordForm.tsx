"use client";

import React from "react";
import styles from "./ForgotPasswordForm.module.scss";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import Link from "next/link";
import { sendResetEmail } from "@/app/actions/sendResetEmail";
import { useSearchParams } from "next/navigation";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

export default function ForgotPasswordForm() {
  const [resultState, formAction] = useFormState(sendResetEmail, undefined);
  const { localMessages, clearErrorMessage } = useFormMessages(resultState);

  const searchParams = useSearchParams();
  const userType = searchParams.get("type") as UserType;

  return (
    <form action={formAction} className={styles.form}>
      <TextInput
        id="email"
        label="Email"
        type="email"
        name="email"
        placeholder="e.g., example@aaasobo.com"
        icon={<EnvelopeIcon className={styles.icon} />}
        required={true}
        onChange={() => clearErrorMessage("message")}
      />

      {/* Hidden input to send necessary data with form submission. */}
      <input type="hidden" name="userType" value={userType ?? ""} />

      <div className={styles.buttonWrapper}>
        <ActionButton btnText="Submit" className="bookBtn" type="submit" />
      </div>

      <div className={styles.messageWrapper}>
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

      <Link
        className={styles.loginLink}
        href={
          userType === "customer" ? "/customers/login" : "/instructors/login"
        }
      >
        Return to login page
      </Link>
    </form>
  );
}

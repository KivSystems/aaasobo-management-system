"use client";

import React, { useMemo } from "react";
import styles from "./PasswordResetForm.module.scss";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import Link from "next/link";
import { sendResetEmail } from "@/app/actions/sendResetEmail";
import { useSearchParams } from "next/navigation";

export default function PasswordResetForm() {
  const [resultState, formAction] = useFormState(sendResetEmail, undefined);
  const formMessage = useMemo(
    () => (resultState ? { message: resultState.message } : undefined),
    [resultState],
  );
  const { localMessages, clearErrorMessage } = useFormMessages(formMessage);
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

      <input type="hidden" name="userType" value={userType} />

      <div className={styles.buttonWrapper}>
        <ActionButton btnText="Submit" className="bookBtn" type="submit" />
      </div>

      <div className={styles.messageWrapper}>
        {!resultState?.success && localMessages.message && (
          // TODO: Create a component for error message
          <>
            <ExclamationTriangleIcon
              className={`${styles.icon} ${styles["icon--error"]}`}
            />{" "}
            <p className={styles.errorText}>{localMessages.message}</p>
          </>
        )}
        {resultState?.success && localMessages.message && (
          // TODO: Create a component for error message
          <>
            <CheckCircleIcon
              className={`${styles.icon} ${styles["icon--success"]}`}
            />{" "}
            <p className={styles.successText}>{localMessages.message}</p>
          </>
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

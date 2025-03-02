"use client";

import React, { useEffect, useState } from "react";
import styles from "./LoginForm.module.scss";
import { authenticate } from "@/app/actions/authActions";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useFormMessages } from "@/app/hooks/useFormMessages";

export default function LoginForm({ userType }: { userType: UserType }) {
  const [errorState, formAction] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const { localMessages, clearErrorMessage } = useFormMessages(errorState);

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

      <TextInput
        id="password"
        label="Password"
        type="password"
        name="password"
        placeholder="Enter password"
        icon={<LockClosedIcon className={styles.icon} />}
        required={true}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
        onChange={() => clearErrorMessage("message")}
      />

      <input type="hidden" name="userType" value={userType} />

      <div className={styles.buttonWrapper}>
        <ActionButton btnText="Log in" className="bookBtn" type="submit" />
      </div>

      <div className={styles.errorWrapper}>
        {localMessages.message && (
          <>
            <ExclamationTriangleIcon className={styles.errorIcon} />{" "}
            <p className={styles.errorText}>{localMessages.message}</p>
          </>
        )}
      </div>
    </form>
  );
}

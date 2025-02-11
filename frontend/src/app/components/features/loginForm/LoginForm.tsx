"use client";

import React, { useState } from "react";
import styles from "./LoginForm.module.scss";
import { authenticate } from "@/app/actions/authActions";
import { useFormState } from "react-dom";
import TextInput from "../../elements/textInput/TextInput";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";

export default function LoginForm({ userType }: { userType: UserType }) {
  const [errorMessage, formAction, isPending] = useFormState(
    authenticate,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);

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
      />

      <input type="hidden" name="userType" value={userType} />

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText="Log in"
          className="bookBtn"
          type="submit"
          disabled={isPending}
        />
      </div>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
    </form>
  );
}

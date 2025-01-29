"use client";

import React from "react";
import styles from "./LoginForm.module.scss";
import { authenticate } from "@/app/actions/authActions";
import { useFormState } from "react-dom";

export default function LoginForm({ userType }: { userType: UserType }) {
  const [errorMessage, formAction, isPending] = useFormState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className={styles.form}>
      <div>
        <label htmlFor="email">Email</label>
        <div className="relative">
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            required
            // TODO: set the minimum length of password with "minLength={6}"
          />
        </div>
      </div>

      <input type="hidden" name="userType" value={userType} />
      <button aria-disabled={isPending}>Log in</button>
      <div>
        {errorMessage && (
          <>
            <p>{errorMessage}</p>
          </>
        )}
      </div>
    </form>
  );
}

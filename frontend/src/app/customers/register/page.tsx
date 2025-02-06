"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { prefectures } from "@/app/helper/data/data";
import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";
import TextInput from "@/app/components/elements/textInput/TextInput";
import {
  EnvelopeIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormState } from "react-dom";
import { customerRegisterHandler } from "@/app/actions/actions";

export default function Register() {
  const router = useRouter();
  const [state, formAction, isPending] = useFormState(
    customerRegisterHandler,
    undefined,
  );

  // Handle success toast and redirect
  useEffect(() => {
    if (state?.redirectUrl && state?.successMessage) {
      toast.success(state.successMessage);
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <main className={styles.outsideContainer}>
      <div className={styles.container}>
        <Image
          src={"/images/logo2.svg"}
          alt="logo"
          width={100}
          height={100}
          className={styles.logo}
          priority={true}
        />

        <h2>Create a free account</h2>

        <p className={styles.paragraph}>
          Already a member? <Link href="/customers/login">Log In</Link>
        </p>

        <form className={styles.form} action={formAction}>
          <p className={styles.required}>*Required</p>
          <TextInput
            id="name"
            label="Name"
            type="text"
            placeholder="e.g., John Doe"
            icon={<UserCircleIcon className={styles.icon} />}
            inputRequired={true}
            name="name"
            error={state?.validationErrors?.name}
          />

          <TextInput
            id="email"
            label="Email"
            type="email"
            placeholder="e.g., example@aaasobo.com"
            icon={<EnvelopeIcon className={styles.icon} />}
            inputRequired={true}
            name="email"
            error={state?.validationErrors?.email || state?.emailConflict}
          />

          <TextInput
            id="password"
            label="Password"
            type="password"
            placeholder="Create a password (8+ characters)"
            icon={<LockClosedIcon className={styles.icon} />}
            inputRequired={true}
            name="password"
            minLength={8}
            autoComplete="new-password"
            error={state?.validationErrors?.password}
          />

          <TextInput
            id="passConfirmation"
            label="Password Confirmation"
            type="password"
            placeholder="Re-enter your password"
            icon={<LockClosedIcon className={styles.icon} />}
            inputRequired={true}
            name="passConfirmation"
            error={state?.validationErrors?.passConfirmation}
          />

          <label className={styles.label}>
            Prefecture of Residence
            <span className={styles.required}>*</span>
            <div className={styles.selectWrapper}>
              <HomeIcon className={styles.icon} />
              <select
                id="prefecture"
                name="prefecture"
                className={styles.select}
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select your prefecture of residence
                </option>
                {prefectures.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </div>
            {state?.validationErrors?.prefecture && (
              <p className={styles.errorText}>
                {state?.validationErrors?.prefecture}
              </p>
            )}
          </label>

          <label className={styles.label}>
            Privacy Policy
            <span className={styles.required}>*</span>
            <p className={styles.privacyPolicy}>
              We will take a screenshot as a record that the class was
              conducted. Additionally, we may record the session for the purpose
              of improving the instructor&apos;s skills.
            </p>
          </label>
          <div className={styles.checkboxWrapper}>
            <label className={styles.label}>
              <input type="checkbox" name="isAgreed" value="true" required />I
              agree.
            </label>
            {state?.validationErrors?.isAgreed && (
              <p className={styles.errorText}>
                {state?.validationErrors?.isAgreed}
              </p>
            )}
          </div>

          <div className={styles.buttonWrapper}>
            <ActionButton
              btnText="Create Account"
              className="bookBtn"
              type="submit"
              disabled={isPending}
            />
          </div>
          {state?.error && <p className={styles.errorText}>{state?.error}</p>}
        </form>
      </div>
    </main>
  );
}

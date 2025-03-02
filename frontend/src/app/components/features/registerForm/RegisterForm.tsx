"use client";

import { useState } from "react";
import { useInput } from "@/app/hooks/useInput";
import { prefectures } from "@/app/helper/data/data";
import styles from "./RegisterForm.module.scss";
import {
  EnvelopeIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import TextInput from "../../elements/textInput/TextInput";
import PasswordStrengthMeter from "../../elements/passwordStrengthMeter/PasswordStrengthMeter";
import { useFormState } from "react-dom";
import { registerUser } from "@/app/actions/registerUser";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { usePasswordStrength } from "@/app/hooks/usePasswordStrength";
import CheckboxInput from "../../elements/checkboxInput/CheckboxInput";

const RegisterForm = ({ userType }: { userType: UserType }) => {
  const [registerResultState, formAction] = useFormState(
    registerUser,
    undefined,
  );
  const [password, onPasswordChange] = useInput();
  const [selectedPrefecture, setSelectedPrefecture] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { localMessages, clearErrorMessage } =
    useFormMessages(registerResultState);
  const { passwordStrength, passwordFeedback } = usePasswordStrength(password);

  return (
    <form action={formAction} className={styles.form}>
      <p className={styles.required}>*Required</p>
      <TextInput
        id="name"
        label="Name"
        type="text"
        name="name"
        placeholder="e.g., John Doe"
        icon={<UserCircleIcon className={styles.icon} />}
        inputRequired
        error={localMessages.name}
        onChange={() => clearErrorMessage("name")}
      />
      <TextInput
        id="email"
        label="Email"
        type="email"
        name="email"
        placeholder="e.g., example@aaasobo.com"
        icon={<EnvelopeIcon className={styles.icon} />}
        inputRequired
        error={localMessages.email}
        onChange={() => clearErrorMessage("email")}
      />
      <TextInput
        id="password"
        label="Password"
        type="password"
        name="password"
        value={password}
        placeholder="At least 8 characters"
        onChange={(event) => {
          onPasswordChange(event);
          clearErrorMessage("password");
        }}
        icon={<LockClosedIcon className={styles.icon} />}
        inputRequired
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
      <input
        type="hidden"
        id="passwordStrength"
        name="passwordStrength"
        value={passwordStrength}
      />
      <TextInput
        id="passConfirmation"
        label="Password Confirmation"
        type="password"
        name="passConfirmation"
        placeholder="Re-enter your password"
        icon={<LockClosedIcon className={styles.icon} />}
        inputRequired
        error={localMessages.passConfirmation}
        onChange={() => clearErrorMessage("passConfirmation")}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
      />

      {/* TODO: If this component supports multiple user types, render the appropriate UI for each. */}
      <label className={styles.label}>
        Prefecture of Residence <span className={styles.required}>*</span>
        <div className={styles.selectWrapper}>
          <HomeIcon className={styles.icon} />
          <select
            className={styles.select}
            id="prefecture"
            name="prefecture"
            value={selectedPrefecture}
            onChange={(e) => {
              setSelectedPrefecture(e.target.value);
              clearErrorMessage("prefecture");
            }}
            required
            style={{ color: selectedPrefecture ? "black" : "gray" }}
          >
            <option value="" disabled>
              Select a prefecture
            </option>
            {prefectures.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </div>
        {localMessages.prefecture && (
          <p className={styles.errorText}>{localMessages.prefecture}</p>
        )}
      </label>

      <label className={styles.label}>
        Privacy Policy
        <span className={styles.required}>*</span>
        <p className={styles.privacyPolicy}>
          We will take a screenshot as a record that the class was conducted.
          Additionally, we may record the session for the purpose of improving
          the instructor&apos;s skills.
        </p>
      </label>

      <CheckboxInput
        name="isAgreed"
        label="I agree."
        error={localMessages.isAgreed}
      />

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText="Create Account"
          className="bookBtn"
          type="submit"
        />
      </div>
      {localMessages.unexpectedError && (
        <p className={styles.errorText}>{localMessages.unexpectedError}</p>
      )}
      {localMessages.success && (
        <p className={styles.successText}>{localMessages.success}</p>
      )}
    </form>
  );
};

export default RegisterForm;

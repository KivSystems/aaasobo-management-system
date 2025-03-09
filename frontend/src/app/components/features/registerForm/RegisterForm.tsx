"use client";

import { useState } from "react";
import { useInput } from "@/app/hooks/useInput";
import styles from "./RegisterForm.module.scss";
import {
  EnvelopeIcon,
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
import PrefectureSelect from "./prefectureSelect/PrefectureSelect";
import PrivacyPolicyAgreement from "./privacyPolicyAgreement/PrivacyPolicyAgreement";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

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

      <input
        type="hidden"
        name="passwordStrength"
        value={passwordStrength ?? ""}
      />
      <input type="hidden" name="userType" value={userType ?? ""} />

      {/* TODO: If this component supports multiple user types, render the appropriate UI for each. */}
      {userType === "customer" && (
        <>
          <PrefectureSelect
            selectedPrefecture={selectedPrefecture}
            setSelectedPrefecture={setSelectedPrefecture}
            clearErrorMessage={clearErrorMessage}
            localMessages={localMessages}
          />
          <PrivacyPolicyAgreement localMessages={localMessages} />
        </>
      )}

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText="Create Account"
          className="bookBtn"
          type="submit"
        />
      </div>

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
    </form>
  );
};

export default RegisterForm;

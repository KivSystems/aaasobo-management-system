"use client";

import { useState } from "react";
import { useInput } from "@/app/hooks/useInput";
import styles from "./RegisterForm.module.scss";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
  DocumentTextIcon,
  IdentificationIcon,
  KeyIcon,
  LinkIcon,
  PhotoIcon,
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

const RegisterForm = ({
  userType,
  language,
}: {
  userType: UserType;
  language?: LanguageType;
}) => {
  const [registerResultState, formAction] = useFormState(
    registerUser,
    undefined,
  );
  const [password, onPasswordChange] = useInput();
  const [showPassword, setShowPassword] = useState(false);
  const { localMessages, clearErrorMessage } =
    useFormMessages(registerResultState);
  const { passwordStrength } = usePasswordStrength(password);

  return (
    <form action={formAction} className={styles.form}>
      {/* Hidden fields to include in form submission */}
      <input type="hidden" name="userType" value={userType ?? ""} />
      <input
        type="hidden"
        name="passwordStrength"
        value={passwordStrength ?? ""}
      />

      {userType === "customer" && (
        <>
          <TextInput
            id="name"
            type="text"
            name="name"
            required
            placeholder={language === "ja" ? "名前" : "Name"}
            icon={<UserCircleIcon className={styles.icon} />}
            error={localMessages.name}
            onChange={() => clearErrorMessage("name")}
          />
          <TextInput
            id="email"
            type="email"
            name="email"
            required
            placeholder={language === "ja" ? "メール" : "E-mail"}
            icon={<EnvelopeIcon className={styles.icon} />}
            error={localMessages.email}
            onChange={() => clearErrorMessage("email")}
          />
          <TextInput
            id="password"
            type="password"
            name="password"
            required
            value={password}
            placeholder={
              language === "ja"
                ? "パスワード(8文字以上)"
                : "Password (8+ chars)"
            }
            onChange={(event) => {
              onPasswordChange(event);
              clearErrorMessage("password");
            }}
            icon={<LockClosedIcon className={styles.icon} />}
            minLength={8}
            error={localMessages.password}
            showPassword={showPassword}
            onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
            language={language}
          />
          <PasswordStrengthMeter
            password={password}
            passwordStrength={passwordStrength}
            language={language}
          />
          <TextInput
            id="passConfirmation"
            type="password"
            name="passConfirmation"
            required
            placeholder={
              language === "ja" ? "パスワード再入力" : "Re-enter password"
            }
            icon={<LockClosedIcon className={styles.icon} />}
            error={localMessages.passConfirmation}
            onChange={() => clearErrorMessage("passConfirmation")}
            showPassword={showPassword}
            onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
            language={language}
          />
          <PrefectureSelect
            clearErrorMessage={clearErrorMessage}
            errorMessage={localMessages.prefecture}
            language={language!}
          />
          <PrivacyPolicyAgreement
            localMessages={localMessages}
            language={language!}
          />
          <input type="hidden" name="language" value={language ?? "en"} />
        </>
      )}

      {userType === "instructor" && (
        <>
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
            id="nickname"
            label="Nickname"
            type="text"
            name="nickname"
            placeholder="e.g., John"
            icon={<UserCircleIcon className={styles.icon} />}
            inputRequired
            error={localMessages.name}
            onChange={() => clearErrorMessage("nickname")}
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
          <TextInput
            id="icon"
            label="Icon"
            type="text"
            name="icon"
            placeholder="e.g., john-1.jpg"
            icon={<PhotoIcon className={styles.icon} />}
            inputRequired
            onChange={() => clearErrorMessage("icon")}
          />
          <TextInput
            id="classURL"
            label="Class URL"
            type="text"
            name="classURL"
            placeholder="e.g., https://zoom.us/j/..."
            icon={<LinkIcon className={styles.icon} />}
            inputRequired
            onChange={() => clearErrorMessage("classURL")}
          />
          <TextInput
            id="meetingId"
            label="Meeting ID"
            type="text"
            name="meetingId"
            placeholder="e.g., 123 456 7890"
            icon={<IdentificationIcon className={styles.icon} />}
            inputRequired
            onChange={() => clearErrorMessage("meetingId")}
          />
          <TextInput
            id="passcode"
            label="Pass Code"
            type="text"
            name="passcode"
            placeholder="e.g., 123456"
            icon={<KeyIcon className={styles.icon} />}
            inputRequired
            onChange={() => clearErrorMessage("passcode")}
          />
          <TextInput
            id="introductionURL"
            label="Introduction URL"
            type="text"
            name="introductionURL"
            placeholder="e.g., https://..."
            icon={<DocumentTextIcon className={styles.icon} />}
            inputRequired
            onChange={() => clearErrorMessage("introductionURL")}
          />
        </>
      )}

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

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText={language === "ja" ? "アカウント登録" : "Create Account"}
          className="bookBtn"
          type="submit"
        />
      </div>
    </form>
  );
};

export default RegisterForm;

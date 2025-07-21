"use client";

import { useRef, useState } from "react";
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
import Uploader from "./uploadImages/Uploader";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={formAction}
      className={styles.form}
      encType="multipart/form-data"
    >
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
      {userType === "instructor" && (
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
      )}
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

      <input
        type="hidden"
        name="passwordStrength"
        value={passwordStrength ?? ""}
      />
      <input type="hidden" name="userType" value={userType ?? ""} />

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

      {userType === "instructor" && (
        <>
          <input
            type="file"
            name="icon"
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <Uploader
            onFileSelect={(file) => {
              if (fileInputRef.current && file) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
              }
            }}
            clearFileInputRef={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            label={"Instructor profile image"}
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

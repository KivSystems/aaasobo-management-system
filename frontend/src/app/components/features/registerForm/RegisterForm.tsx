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
  AcademicCapIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import TextInput from "../../elements/textInput/TextInput";
import PasswordStrengthMeter from "../../elements/passwordStrengthMeter/PasswordStrengthMeter";
import { useFormState } from "react-dom";
import { registerUser } from "@/app/actions/registerUser";
import { registerContent } from "@/app/actions/registerContent";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { usePasswordStrength } from "@/app/hooks/usePasswordStrength";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

const RegisterForm = ({
  categoryType,
  userType,
  language,
}: {
  categoryType?: CategoryType;
  userType: UserType;
  language?: LanguageType;
}) => {
  // Handle the action based on userType and categoryType
  const actionHandler =
    userType === "admin" && categoryType ? registerContent : registerUser;
  const [registerResultState, formAction] = useFormState(
    actionHandler,
    undefined,
  );

  const [password, onPasswordChange] = useInput();
  const [showPassword, setShowPassword] = useState(false);
  const [colorValue, setColorValue] = useState("#000000"); // Default color value
  const { localMessages, clearErrorMessage } =
    useFormMessages(registerResultState);
  const { passwordStrength } = usePasswordStrength(password);

  return (
    <form action={formAction} className={styles.form}>
      {/* Hidden fields to include in form submission */}
      <input type="hidden" name="userType" value={userType ?? ""} />
      <input type="hidden" name="categoryType" value={categoryType ?? ""} />
      <input
        type="hidden"
        name="passwordStrength"
        value={passwordStrength ?? ""}
      />

      {((userType === "admin" && !categoryType) ||
        userType === "instructor") && (
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

          {userType === "instructor" && (
            <>
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
        </>
      )}

      {/* Plan registration (only for admin) */}
      {userType === "admin" && categoryType === "plan" && (
        <>
          <p className={styles.required}>*Required</p>
          <TextInput
            id="name"
            label="Plan Name"
            type="text"
            name="name"
            placeholder="e.g., 3,180 yen/month"
            icon={<AcademicCapIcon className={styles.icon} />}
            inputRequired
            error={localMessages.name}
            onChange={() => clearErrorMessage("name")}
          />
          <TextInput
            id="weeklyClassTimes"
            label="Weekly Class Times"
            type="number"
            name="weeklyClassTimes"
            placeholder="e.g., 2"
            icon={<CalendarIcon className={styles.icon} />}
            inputRequired
            error={localMessages.weeklyClassTimes}
            onChange={() => clearErrorMessage("weeklyClassTimes")}
          />
          <TextInput
            id="description"
            label="Description"
            type="text"
            name="description"
            placeholder="e.g., 2 classes per week"
            icon={<DocumentTextIcon className={styles.icon} />}
            inputRequired
            error={localMessages.description}
            onChange={() => clearErrorMessage("description")}
          />{" "}
        </>
      )}

      {/* Event registration (only for admin) */}
      {userType === "admin" && categoryType === "event" && (
        <>
          <p className={styles.required}>*Required</p>
          <TextInput
            id="name"
            label="Event Name"
            type="text"
            name="eventName"
            placeholder="e.g., アーソボイベント / AaasoBo! Event"
            icon={<AcademicCapIcon className={styles.icon} />}
            inputRequired
            error={localMessages.name}
            onChange={() => clearErrorMessage("name")}
          />
          <div className={styles.eventColor}>
            <TextInput
              id="color"
              label="Color Code"
              type="color"
              name="color"
              value={colorValue}
              icon={<DocumentTextIcon className={styles.icon} />}
              inputRequired
              error={localMessages.color}
              onChange={(e) => {
                setColorValue(e.target.value);
                clearErrorMessage("color");
              }}
            />
            <div className={styles.eventColor__text}>
              {colorValue.toUpperCase()}
            </div>
          </div>
        </>
      )}

      {/* Error and success messages */}
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

      {/* Submission Button */}
      {!categoryType ? (
        <div className={styles.buttonWrapper}>
          <ActionButton
            btnText={language === "ja" ? "アカウント登録" : "Create Account"}
            className="bookBtn"
            type="submit"
          />
        </div>
      ) : (
        <div className={styles.buttonWrapper}>
          <ActionButton
            btnText={`Register ${
              categoryType
                ? categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
                : ""
            }`}
            className="bookBtn"
            type="submit"
          />
        </div>
      )}
    </form>
  );
};

export default RegisterForm;

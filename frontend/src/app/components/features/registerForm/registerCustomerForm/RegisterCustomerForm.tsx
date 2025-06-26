"use client";

import styles from "./RegisterCustomerForm.module.scss";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import TextInput from "@/app/components/elements/textInput/TextInput";
import { usePasswordStrength } from "@/app/hooks/usePasswordStrength";
import { useState } from "react";
import PasswordStrengthMeter from "@/app/components/elements/passwordStrengthMeter/PasswordStrengthMeter";
import PrefectureSelect from "../prefectureSelect/PrefectureSelect";
import PrivacyPolicyAgreement from "../privacyPolicyAgreement/PrivacyPolicyAgreement";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { createCustomerRegisterSchema } from "@/app/schemas/authSchema";
import { extractRegisterValidationErrors } from "@/app/helper/utils/validationErrorUtils";
import { checkEmailConflicts } from "@/app/helper/api/customersApi";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { useFormFieldSetter } from "@/app/hooks/useFormFieldSetter";

const RegisterCustomerForm = ({
  customerData,
  setCustomerData,
  onNextStep,
  language,
}: RegisterCustomerProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { passwordStrength } = usePasswordStrength(customerData.password);
  const { localMessages, setLocalMessages, clearErrorMessage } =
    useFormMessages<StringMessages>();

  const handleChange = useFormFieldSetter(setCustomerData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const schema = createCustomerRegisterSchema(language);

    const parsedForm = schema.safeParse({
      name: customerData.name,
      email: customerData.email,
      password: customerData.password,
      passwordStrength,
      prefecture: customerData.prefecture,
      isAgreed: customerData.isAgreed,
    });

    if (!parsedForm.success) {
      const validationErrors = parsedForm.error.errors;
      const errors = extractRegisterValidationErrors(
        validationErrors,
        language,
      );
      setIsLoading(false);
      return setLocalMessages(errors);
    }

    const result = await checkEmailConflicts(parsedForm.data.email, language);

    if (!result.isValid) {
      setIsLoading(false);
      return setLocalMessages(result.messages ?? {});
    }

    onNextStep();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    >
      <>
        <TextInput
          id="name"
          type="text"
          defaultValue={customerData.name}
          required
          placeholder={language === "ja" ? "名前" : "Name"}
          icon={<UserCircleIcon className={styles.icon} />}
          error={localMessages.name}
          onChange={(e) => {
            handleChange("name", e.target.value);
            clearErrorMessage("name");
          }}
        />

        <TextInput
          id="email"
          type="email"
          defaultValue={customerData.email}
          required
          placeholder={language === "ja" ? "メール" : "E-mail"}
          icon={<EnvelopeIcon className={styles.icon} />}
          error={localMessages.email}
          onChange={(e) => {
            handleChange("email", e.target.value);
            clearErrorMessage("email");
          }}
        />

        <TextInput
          type="password"
          defaultValue={customerData.password}
          required
          placeholder={
            language === "ja" ? "パスワード(8文字以上)" : "Password (8+ chars)"
          }
          icon={<LockClosedIcon className={styles.icon} />}
          minLength={8}
          error={localMessages.password}
          onChange={(e) => {
            handleChange("password", e.target.value);
            clearErrorMessage("password");
          }}
          showPassword={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
          language={language}
        />

        <PasswordStrengthMeter
          password={customerData.password}
          passwordStrength={passwordStrength}
          language={language}
        />

        <PrefectureSelect
          {...(customerData.prefecture !== "" && {
            defaultValue: customerData.prefecture,
          })}
          error={localMessages.prefecture}
          onChange={(e) => {
            handleChange("prefecture", e.target.value);
            clearErrorMessage("prefecture");
          }}
          language={language!}
        />

        <PrivacyPolicyAgreement
          onChange={(e) => {
            handleChange("isAgreed", e.target.checked);
            clearErrorMessage("isAgreed");
          }}
          checked={customerData.isAgreed}
          error={localMessages.isAgreed}
          language={language!}
        />
      </>

      <div className={styles.messageWrapper}>
        {localMessages.errorMessage && (
          <FormValidationMessage
            type="error"
            message={localMessages.errorMessage}
          />
        )}
      </div>

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText={language === "ja" ? "次へ" : "Next"}
          className="bookBtn"
          type="submit"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default RegisterCustomerForm;

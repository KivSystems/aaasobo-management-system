"use client";

import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";
import InputField from "../../elements/inputField/InputField";
import TextAreaInput from "../../elements/textAreaInput/TextAreaInput";
import BirthdateInput from "../../features/registerForm/birthdateInput/BirthdateInput";
import styles from "./AddChildForm.module.scss";

const AddChildForm = ({
  language,
  action,
  customerId,
  localMessages,
  isAdminAuthenticated,
  isError,
  clearErrorMessage,
}: AddChildFormProps) => {
  return (
    <form className={styles.addChildForm} action={action}>
      {/* Child Name */}
      <InputField
        name="name"
        type="text"
        placeholder={
          language === "ja"
            ? "お子さまのお名前(ローマ字で)"
            : "Child's name (in English)"
        }
        className={styles.addChildForm__inputField}
        onChange={() => clearErrorMessage("name")}
        error={localMessages.name?.[language]}
      />

      {/* Birthdate */}
      <div className={styles.addChildForm__birthdate}>
        <p className={styles.addChildForm__label}>
          {language === "ja"
            ? "お子さまの生年月日(半角数字)"
            : "Child's date of birth"}
        </p>
        <BirthdateInput
          error={localMessages.birthdate?.[language]}
          language={language}
        />
      </div>

      {/* Personal Info */}
      <TextAreaInput
        label={
          language === "ja"
            ? "お子さまの年齢・英語レベル・好きなことや食べ物をお教えください(できましたら英語で。日本語も可)"
            : "Tell us your child's age, English level, and likes (English preferred, Japanese OK)."
        }
        placeholder={
          language === "ja"
            ? "例. 5 years old, Beginner, Car, Peppapig"
            : "e.g., 5 years old, Beginner, Car, Peppapig"
        }
        error={localMessages.personalInfo?.[language]}
        onChange={() => clearErrorMessage("personalInfo")}
        required
        language={language}
        name="personalInfo"
        className="addChild"
      />

      <div className={styles.addChildForm__messageWrapper}>
        {isError && (
          <FormValidationMessage
            type="error"
            message={localMessages.errorMessage[language]}
          />
        )}
      </div>

      {isAdminAuthenticated && (
        <input type="hidden" name="customerId" value={customerId ?? ""} />
      )}

      <div className={styles.addChildForm__button}>
        <ActionButton
          className="saveCustomer"
          btnText={language === "ja" ? "お子さまを追加" : "Add Child"}
          type="submit"
        />
      </div>
    </form>
  );
};

export default AddChildForm;

import React, { ChangeEvent } from "react";
import styles from "./TextInput.module.scss";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "../tooltip/Tooltip";
import FormValidationMessage from "../formValidationMessage/FormValidationMessage";

type TextInputProps = {
  id?: string;
  label: string;
  type: string;
  value?: string;
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  inputRequired?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  showPassword?: boolean;
  onTogglePasswordVisibility?: () => void;
};

function TextInput({
  id,
  label,
  type,
  value,
  placeholder,
  onChange,
  icon,
  inputRequired,
  required,
  name,
  error,
  minLength,
  pattern,
  autoComplete,
  showPassword = false,
  onTogglePasswordVisibility,
}: TextInputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {inputRequired ? <span className={styles.required}>*</span> : ""}
        <div className={styles.inputContainer}>
          {icon ? <div className={styles.icon}>{icon}</div> : ""}
          <input
            id={id}
            type={showPassword ? "text" : type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={styles.inputField}
            required={inputRequired || required}
            name={name}
            minLength={minLength}
            pattern={pattern}
            autoComplete={autoComplete}
          />
          {type === "password" && (
            <Tooltip
              message={showPassword ? "Click to hide" : "Click to reveal"}
            >
              <div
                className={styles.eyeIcon}
                onClick={onTogglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlashIcon className={styles.eyeIconSvg} />
                ) : (
                  <EyeIcon className={styles.eyeIconSvg} />
                )}
              </div>
            </Tooltip>
          )}
        </div>
        {error && (
          <FormValidationMessage
            type="error"
            message={error}
            className="textInputError"
          />
        )}
      </label>
    </div>
  );
}

export default TextInput;

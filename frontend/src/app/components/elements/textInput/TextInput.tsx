import React, { ChangeEvent } from "react";
import styles from "./TextInput.module.scss";

type TextInputProps = {
  id?: string;
  label: string;
  type: string;
  value?: string;
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  inputRequired?: boolean;
  name?: string;
  error?: string;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
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
  name,
  error,
  minLength,
  pattern,
  autoComplete,
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
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={styles.inputField}
            required={inputRequired}
            name={name}
            minLength={minLength}
            pattern={pattern}
            autoComplete={autoComplete}
          />
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </label>
    </div>
  );
}

export default TextInput;

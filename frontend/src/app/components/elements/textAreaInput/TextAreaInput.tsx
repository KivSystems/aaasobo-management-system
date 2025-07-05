import FormValidationMessage from "../formValidationMessage/FormValidationMessage";
import styles from "./TextAreaInput.module.scss";

const TextAreaInput = ({
  id,
  label,
  defaultValue,
  placeholder,
  required,
  error,
  onChange,
  language = "en",
}: TextAreaInputProps) => {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label && <p className={styles.label__text}>{label}</p>}
        <div className={styles.inputWrapper}>
          <textarea
            id={id}
            className={styles.inputField}
            defaultValue={defaultValue}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
          />
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
};

export default TextAreaInput;

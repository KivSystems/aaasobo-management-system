import styles from "./InputField.module.scss";
import clsx from "clsx";
import FormValidationMessage from "../formValidationMessage/FormValidationMessage";

function InputField({
  name,
  error,
  value,
  defaultValue,
  onChange,
  type = "text",
  className,
  placeholder,
  min,
  display = "block",
}: {
  name?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  placeholder?: string;
  min?: string; // Only applies when the input type is "date"
  display?: "block" | "inline-block" | "flex";
}) {
  return (
    <div className={styles[`display__${display}`]}>
      <input
        name={name}
        className={clsx(className)}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required
        placeholder={placeholder}
        min={min}
      />
      {error && (
        <FormValidationMessage
          type="error"
          message={error}
          className="textInputError"
        />
      )}
    </div>
  );
}

export default InputField;

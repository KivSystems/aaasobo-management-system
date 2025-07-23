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
}: {
  name?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <input
        name={name}
        className={clsx(className)}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required
        placeholder={placeholder}
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

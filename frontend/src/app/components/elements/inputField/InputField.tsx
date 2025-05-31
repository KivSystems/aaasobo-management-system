import clsx from "clsx";
import FormValidationMessage from "../formValidationMessage/FormValidationMessage";

function InputField({
  name,
  error,
  value,
  onChange,
  type = "text",
  className,
}: {
  name?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div>
      <input
        name={name}
        className={clsx(className)}
        type={type}
        value={value}
        onChange={onChange}
        required
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

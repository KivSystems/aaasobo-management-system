import clsx from "clsx";

function InputField({
  name,
  value,
  onChange,
  type = "text",
  className,
}: {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      name={name}
      className={clsx(className)}
      type={type}
      value={value}
      onChange={onChange}
      required
    />
  );
}

export default InputField;

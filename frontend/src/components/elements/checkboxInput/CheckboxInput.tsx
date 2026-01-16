import { ChangeEvent } from "react";
import styles from "./CheckboxInput.module.scss";

export default function CheckboxInput({
  name,
  label,
  onChange,
  checked,
  className,
  onClick,
}: {
  name?: string;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className={`${styles.checkboxWrapper} ${className ? styles[className] : ""}`}
      onClick={onClick}
    >
      <label className={styles.label}>
        <input
          type="checkbox"
          name={name}
          required
          onChange={onChange}
          checked={checked}
        />{" "}
        <p>{label}</p>
      </label>
    </div>
  );
}

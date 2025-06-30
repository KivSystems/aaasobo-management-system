import { ChangeEvent } from "react";
import styles from "./CheckboxInput.module.scss";

export default function CheckboxInput({
  name,
  label,
  onChange,
  checked,
  className,
}: {
  name?: string;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${styles.checkboxWrapper} ${className ? styles[className] : ""}`}
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

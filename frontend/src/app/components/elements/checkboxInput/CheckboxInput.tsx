import { ChangeEvent } from "react";
import styles from "./CheckboxInput.module.scss";

export default function CheckboxInput({
  name,
  label,
  onChange,
  checked,
}: {
  name?: string;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
}) {
  return (
    <div className={styles.checkboxWrapper}>
      <label className={styles.label}>
        <input
          type="checkbox"
          name={name}
          required
          onChange={onChange}
          checked={checked}
        />{" "}
        {label}
      </label>
    </div>
  );
}

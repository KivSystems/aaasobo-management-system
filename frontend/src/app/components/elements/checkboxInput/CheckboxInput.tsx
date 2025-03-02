import styles from "./CheckboxInput.module.scss";

export default function CheckboxInput({
  name,
  label,
  error,
}: {
  name: string;
  label: string;
  error?: string;
}) {
  return (
    <div className={styles.checkboxWrapper}>
      <label className={styles.label}>
        <input type="checkbox" name={name} required /> {label}
      </label>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

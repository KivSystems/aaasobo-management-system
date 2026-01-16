"use client";

import styles from "./ChildCheckbox.module.scss";
import { CheckIcon } from "@heroicons/react/24/solid";

interface ChildCheckboxProps {
  child: Child;
  checked: boolean;
  onChange: (childId: number) => void;
}

export default function ChildCheckbox({
  child,
  checked,
  onChange,
}: ChildCheckboxProps) {
  return (
    <div
      className={`${styles.childCheckbox} ${checked ? styles.checked : ""}`}
      onClick={() => onChange(child.id)}
    >
      <div className={styles.checkbox}>
        {checked && <CheckIcon className={styles.checkIcon} />}
      </div>
      <span className={styles.childName}>{child.name}</span>
    </div>
  );
}

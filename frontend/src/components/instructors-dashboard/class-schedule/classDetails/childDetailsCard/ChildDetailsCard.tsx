import React from "react";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import styles from "./ChildDetailsCard.module.scss"; // or adjust based on your file structure
import { formatBirthdateToISO } from "@/lib/utils/dateUtils";
import { MASKED_HEAD_LETTERS } from "@/lib/data/data";

export default function ChildDetailsCard({ child }: { child: Child }) {
  return (
    <div className={styles.children__content}>
      <div className={styles.children__header}>
        <div className={styles.children__iconContainer}>
          <UserIconOutline className={styles.children__icon} />
        </div>
        <div className={styles.children__nameContainer}>
          <div className={styles.children__nameTitle}>Name</div>
          <div className={styles.children__name}>{child.name}</div>
        </div>
      </div>
      <div className={styles.children__birthdateContainer}>
        <div className={styles.children__birthdateTitle}>Birthdate</div>
        <div className={styles.children__birthdate}>
          {child.birthdate
            ? child.personalInfo?.includes(MASKED_HEAD_LETTERS)
              ? MASKED_HEAD_LETTERS
              : formatBirthdateToISO(child.birthdate)
            : "N/A"}
        </div>
      </div>
      <div className={styles.children__personalInfoContainer}>
        <div className={styles.children__personalInfoTitle}>Notes</div>
        <div className={styles.children__personalInfo}>
          {child.personalInfo}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import styles from "./RedirectButton.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { PlusIcon } from "@heroicons/react/24/outline";

type RedirectButtonProps = {
  linkURL: string;
  btnText: string;
  btnTextJa?: string;
  disabled?: boolean;
  className?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconType?: "plus";
};

const RedirectButton: React.FC<RedirectButtonProps> = ({
  linkURL,
  btnText,
  btnTextJa,
  disabled = false,
  className = "",
  Icon,
  iconType,
}) => {
  const { language } = useLanguage();
  const displayedText = language === "ja" && btnTextJa ? btnTextJa : btnText;
  const SelectedIcon = Icon || (iconType === "plus" ? PlusIcon : null);

  if (disabled) {
    return (
      <div
        className={`${styles.btnComponent} ${className ? styles[className] : ""} ${styles.disabled}`}
      >
        <div className={styles.content}>
          <div className={styles.text}>{displayedText}</div>
          {SelectedIcon && <SelectedIcon className={styles.icon} />}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={linkURL}
      className={`${styles.btnComponent} ${className ? styles[className] : ""}`}
    >
      <div className={styles.content}>
        <div className={styles.text}>{displayedText}</div>
        {SelectedIcon && <SelectedIcon className={styles.icon} />}
      </div>
    </Link>
  );
};

export default RedirectButton;

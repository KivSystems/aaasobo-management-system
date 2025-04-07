"use client";

import React from "react";
import styles from "./ActionButton.module.scss";
import { useFormStatus } from "react-dom";

type ActionButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  btnText: string;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  btnText,
  disabled = false,
  className = "",
  type = "button",
  Icon,
}) => {
  const { pending } = useFormStatus();

  const isDisabled = disabled || pending;

  return (
    <button
      className={`${styles.btnComponent} ${className ? styles[className] : ""} ${
        isDisabled ? styles.disabled : ""
      }`}
      onClick={onClick}
      type={type}
      disabled={isDisabled}
    >
      <div className={styles.content}>
        <div className={styles.text}>{btnText}</div>
        {Icon && <Icon className={styles.icon} />}
      </div>
    </button>
  );
};

export default ActionButton;

import React, { useState } from "react";
import styles from "./Tooltip.module.scss";

export function Tooltip({
  message,
  children,
  position = "bottom",
  className,
}: {
  message: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div
        className={`${styles.tooltip} ${styles[position]} ${visible ? styles.visible : ""} ${className}`}
      >
        {message}
      </div>
    </div>
  );
}

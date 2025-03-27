import React from "react";
import styles from "./Table.module.scss";

type TableProps = {
  className?: string;
  headItems: string[];
  children: React.ReactNode;
};

const Table: React.FC<TableProps> = ({ className, headItems, children }) => {
  return (
    <div className={`${styles.table} ${className ? styles[className] : ""}`}>
      <div className={styles.table__head}>
        {headItems.map((item) => (
          <h3>{item}</h3>
        ))}
      </div>

      <div className={styles.table__body}>{children}</div>
    </div>
  );
};

export default Table;

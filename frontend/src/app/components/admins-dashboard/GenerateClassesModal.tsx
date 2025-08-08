import React, { ChangeEvent, useState } from "react";
import styles from "./GenerateClassesModal.module.scss";
import ActionButton from "../elements/buttons/actionButton/ActionButton";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

function GenerateClassesModal() {
  const [selectedMonth, setSelectedMonth] = useState("");

  const getSelectableMonths = () => {
    const now = new Date();
    const months = [];

    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = date.toISOString().slice(0, 7); // "YYYY-MM"
      const label = date.toLocaleString("default", {
        year: "numeric",
        month: "long",
      });
      months.push({ value, label });
    }

    return months;
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const selectableMonths = getSelectableMonths();
  return (
    <div className={styles.modalContent}>
      <h2>Generate Classes</h2>
      <div className={styles.dateInfo}>
        <label htmlFor="month">
          <CalendarDaysIcon className={styles.icon} />
        </label>
        <select id="month" value={selectedMonth} onChange={handleChange}>
          <option value="">Select Month</option>
          {selectableMonths.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.actionButton}>
        <ActionButton className="saveEvent" btnText="Generate" type="submit" />
      </div>
    </div>
  );
}

export default GenerateClassesModal;

import React from "react";
import FormValidationMessage from "../elements/formValidationMessage/FormValidationMessage";
import styles from "./TimeSelect.module.scss";
import { ChartBarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

type TimeSelectProps = {
  onChange: () => void;
  time: "year" | "months";
  timeArr: [];
  defaultValue: string;
  error: string;
};

function TimeSelect({
  onChange,
  time,
  timeArr,
  defaultValue,
  error,
}: TimeSelectProps) {
  return (
    <div className={`${styles.timeSelect}`}>
      <div className={styles.selectWrapper}>
        {time === "year" ? (
          <ChartBarIcon className={styles.icon} />
        ) : (
          <DocumentTextIcon className={styles.icon} />
        )}
        <select
          className={styles.select}
          name={time}
          onChange={onChange}
          required
          defaultValue={defaultValue}
        >
          <option value={defaultValue} disabled>
            {defaultValue}
          </option>
          {timeArr.map((time, index) => {
            return (
              <option key={index} value={time}>
                {time}
              </option>
            );
          })}
        </select>
      </div>

      {error && (
        <FormValidationMessage
          type="error"
          message={error}
          className="textInputError"
        />
      )}
    </div>
  );
}

export default TimeSelect;

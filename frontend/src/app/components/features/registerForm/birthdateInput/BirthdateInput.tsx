import styles from "./BirthdateInput.module.scss";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import React, { useEffect, useState } from "react";

const BirthdateInput = ({
  onValidDateChange,
  defaultBirthdate,
  error,
  language,
  useFormAction,
}: BirthdateInputProps) => {
  const [defaultYear, defaultMonth, defaultDay] =
    defaultBirthdate?.split("-") ?? [];

  const [year, setYear] = useState(defaultYear ?? "");
  const [month, setMonth] = useState(defaultMonth ?? "");
  const [day, setDay] = useState(defaultDay ?? "");
  const [localIsoDate, setLocalIsoDate] = useState<string | null>(null);

  const padZero = (val: string) => val.padStart(2, "0");

  useEffect(() => {
    if (year === "" || month === "" || day === "") return;

    const iso = `${year}-${padZero(month)}-${padZero(day)}`;

    if (useFormAction) {
      onValidDateChange(undefined);
      setLocalIsoDate(iso);
    } else {
      onValidDateChange(iso);
    }
  }, [year, month, day, onValidDateChange, useFormAction]);

  return (
    <fieldset className={styles.birthdateInput}>
      <div className={styles.birthdateInput__group}>
        <div className={styles.birthdateInput__field}>
          <input
            className={`${styles.birthdateInput__input} ${styles["birthdateInput__input--year"]}`}
            type="text"
            id="birth-year"
            value={year}
            placeholder="2020"
            onChange={(e) => setYear(e.target.value)}
            required
            pattern="^[0-9]{4}$"
            title="4桁の半角数字で入力してください。"
          />
          <label htmlFor="birth-year">{language === "ja" ? "年" : "Y"}</label>
        </div>

        <div className={styles.birthdateInput__field}>
          <input
            className={`${styles.birthdateInput__input} ${styles["birthdateInput__input--month"]}`}
            type="text"
            id="birth-month"
            value={month}
            placeholder="02"
            onChange={(e) => setMonth(e.target.value)}
            required
            pattern="^[0-9]{1,2}$"
            title="半角数字で入力してください。"
          />
          <label htmlFor="birth-month">{language === "ja" ? "月" : "M"}</label>
        </div>

        <div className={styles.birthdateInput__field}>
          <input
            className={`${styles.birthdateInput__input} ${styles["birthdateInput__input--day"]}`}
            type="text"
            id="birth-day"
            value={day}
            placeholder="20"
            onChange={(e) => setDay(e.target.value)}
            required
            pattern="^[0-9]{1,2}$"
            title="半角数字で入力してください。"
          />
          <label htmlFor="birth-day">{language === "ja" ? "日" : "D"}</label>
        </div>
      </div>

      {/* Hidden input for form submission */}
      {useFormAction && localIsoDate && (
        <input type="hidden" name="birthdate" value={localIsoDate ?? ""} />
      )}

      {error && (
        <FormValidationMessage
          type="error"
          message={error}
          className="textInputError"
        />
      )}
    </fieldset>
  );
};

export default React.memo(BirthdateInput);

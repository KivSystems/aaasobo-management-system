import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import React, { useEffect, useState } from "react";

const BirthdateInput = ({
  onValidDateChange,
  defaultBirthdate,
  error,
  language,
}: BirthdateInputProps) => {
  const [defaultYear, defaultMonth, defaultDay] =
    defaultBirthdate?.split("-") ?? [];

  const [year, setYear] = useState(defaultYear ?? "");
  const [month, setMonth] = useState(defaultMonth ?? "");
  const [day, setDay] = useState(defaultDay ?? "");

  const padZero = (val: string) => val.padStart(2, "0");

  useEffect(() => {
    const iso = `${year}-${padZero(month)}-${padZero(day)}`;
    onValidDateChange(iso);
  }, [year, month, day]);

  return (
    <fieldset style={{ border: "none", padding: 0 }}>
      <legend>
        {language === "ja" ? "お子さまの生年月日" : "Child's date of birth"}
        <span>{language === "ja" ? "(半角数字)" : ""}</span>
      </legend>

      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <input
          type="text"
          id="birth-year"
          value={year}
          placeholder="2020"
          onChange={(e) => setYear(e.target.value)}
          required
          pattern="^[0-9]{4}$"
          title="4桁の半角数字で入力してください。"
          style={{ width: "70px", padding: "4px" }}
        />
        <label htmlFor="birth-year">{language === "ja" ? "年" : "Y"}</label>

        <input
          type="text"
          id="birth-month"
          value={month}
          placeholder="02"
          onChange={(e) => setMonth(e.target.value)}
          required
          pattern="^[0-9]{1,2}$"
          title="半角数字で入力してください。"
          style={{ width: "50px", padding: "4px" }}
        />
        <label htmlFor="birth-month">{language === "ja" ? "月" : "M"}</label>

        <input
          type="text"
          id="birth-day"
          value={day}
          placeholder="20"
          onChange={(e) => setDay(e.target.value)}
          required
          pattern="^[0-9]{1,2}$"
          title="半角数字で入力してください。"
          style={{ width: "50px", padding: "4px" }}
        />
        <label htmlFor="birth-day">{language === "ja" ? "日" : "D"}</label>
      </div>

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

export default BirthdateInput;

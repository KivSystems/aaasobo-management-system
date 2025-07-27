import { prefectures } from "@/app/helper/data/data";
import styles from "./PrefectureSelect.module.scss";
import { HomeIcon } from "@heroicons/react/24/outline";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import { ChangeEvent, memo, useState } from "react";
import { getLocalizedText } from "@/app/helper/utils/stringUtils";

const PrefectureSelect = ({
  onChange,
  language,
  defaultValue = language === "ja" ? "都道府県" : "Select a prefecture",
  withIcon = true,
  error,
  className,
}: {
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  language: LanguageType;
  defaultValue?: string;
  withIcon?: boolean;
  error?: string;
  className?: string;
}) => {
  const placeHolder = language === "ja" ? "都道府県" : "Select a prefecture";
  const isColorBlack =
    !withIcon ||
    (defaultValue !== "都道府県" && defaultValue !== "Select a prefecture");

  return (
    <div
      className={`${styles.prefectureSelect} ${className ? styles[className] : ""}`}
    >
      <div className={styles.selectWrapper}>
        {withIcon && <HomeIcon className={styles.icon} />}
        <select
          className={styles.select}
          name="prefecture"
          onChange={onChange}
          required
          defaultValue={defaultValue}
          style={{ color: isColorBlack ? "black" : "gray" }}
        >
          <option value={placeHolder} disabled>
            {placeHolder}
          </option>
          {prefectures.map((prefecture) => {
            const localizedPrefecture = getLocalizedText(prefecture, language);
            return (
              <option key={prefecture} value={prefecture}>
                {localizedPrefecture}
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
};

export default memo(PrefectureSelect);

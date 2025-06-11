import { prefectures } from "@/app/helper/data/data";
import styles from "./PrefectureSelect.module.scss";
import { HomeIcon } from "@heroicons/react/24/outline";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import { useState } from "react";
import { getLocalizedPrefecture } from "@/app/helper/utils/stringUtils";

const PrefectureSelect = ({
  clearErrorMessage,
  errorMessage,
  language,
  defaultValue = language === "ja" ? "都道府県" : "Select a prefecture",
  className,
  withIcon = true,
}: {
  clearErrorMessage: (field: string) => void;
  errorMessage?: string;
  language: LanguageType;
  defaultValue?: string;
  className?: string;
  withIcon?: boolean;
}) => {
  const [isPrefectureSelected, setIsPrefectureSelected] = useState<boolean>(
    withIcon ? false : true,
  );
  const placeHolder = language === "ja" ? "都道府県" : "Select a prefecture";

  return (
    <div
      className={`${styles.prefectureSelect} ${className ? styles[className] : ""}`}
    >
      <div className={styles.selectWrapper}>
        {withIcon && <HomeIcon className={styles.icon} />}
        <select
          className={styles.select}
          name="prefecture"
          onChange={(e) => {
            setIsPrefectureSelected(true);
            clearErrorMessage("prefecture");
          }}
          required
          defaultValue={defaultValue}
          style={{ color: isPrefectureSelected ? "black" : "gray" }}
        >
          <option value={placeHolder} disabled>
            {placeHolder}
          </option>
          {prefectures.map((prefecture) => {
            const localizedPrefecture = getLocalizedPrefecture(
              prefecture,
              language,
            );
            return (
              <option key={prefecture} value={prefecture}>
                {localizedPrefecture}
              </option>
            );
          })}
        </select>
      </div>

      {errorMessage && (
        <FormValidationMessage
          type="error"
          message={errorMessage}
          className="textInputError"
        />
      )}
    </div>
  );
};

export default PrefectureSelect;

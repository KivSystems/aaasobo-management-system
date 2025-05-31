import { prefectures } from "@/app/helper/data/data";
import styles from "./PrefectureSelect.module.scss";
import { HomeIcon } from "@heroicons/react/24/outline";

const PrefectureSelect = ({
  selectedPrefecture,
  setSelectedPrefecture,
  clearErrorMessage,
  localMessages,
  language,
}: {
  selectedPrefecture: string;
  setSelectedPrefecture: (value: string) => void;
  clearErrorMessage: (field: string) => void;
  localMessages: Record<string, string>;
  language: LanguageType;
}) => {
  return (
    <label className={styles.label}>
      <div className={styles.selectWrapper}>
        <HomeIcon className={styles.icon} />
        <select
          className={styles.select}
          id="prefecture"
          name="prefecture"
          value={selectedPrefecture}
          onChange={(e) => {
            setSelectedPrefecture(e.target.value);
            clearErrorMessage("prefecture");
          }}
          required
          style={{ color: selectedPrefecture ? "black" : "gray" }}
        >
          <option value="" disabled>
            {language === "ja" ? "都道府県" : "Select a prefecture"}
          </option>
          {prefectures.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
      </div>
      {localMessages.prefecture && (
        <p className={styles.errorText}>{localMessages.prefecture}</p>
      )}
    </label>
  );
};

export default PrefectureSelect;

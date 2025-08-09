"use client";

import Image from "next/image";
import styles from "./ModeSelection.module.scss";

interface ModeSelectionProps {
  onModeSelect: (mode: "instructor" | "datetime") => void;
  language: "ja" | "en";
  isFreeTrial: boolean;
}

export default function ModeSelection({
  onModeSelect,
  language,
  isFreeTrial,
}: ModeSelectionProps) {
  const instructorModeTitle =
    language === "ja" ? "講師から選択" : "Select by Instructor";
  const instructorModeDesc =
    language === "ja"
      ? "講師を選んでから、空いている時間を選択"
      : "Choose an instructor first, then select available time";

  const datetimeModeTitle =
    language === "ja" ? "日付から選択" : "Select by Date";
  const datetimeModeDesc =
    language === "ja"
      ? "希望の日を選んでから、その時間帯の講師を選択"
      : "Choose your preferred date first, then select from available instructors";

  return (
    <div className={styles.modeSelection}>
      <div className={styles.modeCards}>
        <div
          className={styles.modeCard}
          onClick={() => onModeSelect("instructor")}
        >
          <Image
            src={"/images/fa-solid_chalkboard-teacher.svg"}
            alt="chalkboard-teacher"
            width={80}
            height={80}
            className={styles.icon}
            priority={true}
          />
          <h3>{instructorModeTitle}</h3>
          <p>{instructorModeDesc}</p>
        </div>

        <div
          className={styles.modeCard}
          onClick={() => onModeSelect("datetime")}
        >
          <Image
            src={"/images/fluent-mdl2_date-time.svg"}
            alt="date-time"
            width={80}
            height={80}
            className={styles.icon}
            priority={true}
          />
          <h3>{datetimeModeTitle}</h3>
          <p>{datetimeModeDesc}</p>
        </div>
      </div>
    </div>
  );
}

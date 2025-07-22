"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookableInstructorsList.module.scss";
import { formatYearDateTime } from "@/app/helper/utils/dateUtils";
import { useMemo } from "react";

export default function RebookableInstructorsList({
  instructorProfiles,
  instructorAvailabilities,
  setInstructorToRebook,
  rebookingOption,
  setRebookingStep,
  dateTimeToRebook,
  language,
}: RebookableInstructorsListProps) {
  const previousRebookingStep =
    rebookingOption === "instructor" ? "selectOption" : "selectDateTime";

  const nextRebookingStep =
    rebookingOption === "instructor" ? "selectDateTime" : "confirmRebooking";

  const rebookableInstructorIds = useMemo(() => {
    if (rebookingOption === "instructor") {
      return [...new Set(instructorAvailabilities.map((a) => a.instructorId))];
    }
    if (rebookingOption === "dateTime") {
      return instructorAvailabilities
        .filter((a) => a.dateTime === dateTimeToRebook)
        .map((a) => a.instructorId);
    }
    return [];
  }, [rebookingOption, instructorAvailabilities, dateTimeToRebook]);

  const selectInstructor = ({ id, name }: { id: number; name: string }) => {
    setInstructorToRebook({ id, name });
    setRebookingStep(nextRebookingStep);
  };

  return (
    <div className={styles.rebookableInstructors}>
      {rebookingOption === "dateTime" && (
        <div className={styles.rebookableInstructors__dateTime}>
          {formatYearDateTime(
            new Date(dateTimeToRebook!),
            language === "ja" ? "ja-JP" : "en-US",
          )}
        </div>
      )}
      <div className={styles.rebookableInstructors__list}>
        {instructorProfiles.map((instructor) => {
          const isRebookable = rebookableInstructorIds.includes(instructor.id);
          return (
            <div
              key={instructor.id}
              className={`${styles.rebookableInstructors__item} ${!isRebookable ? styles["rebookableInstructors__item--disabled"] : ""} `}
            >
              <div className={styles.rebookableInstructors__name}>
                {instructor.name}
              </div>

              {isRebookable ? (
                <ActionButton
                  btnText={language === "ja" ? "選択" : "Select"}
                  className="rebookClass"
                  onClick={() =>
                    selectInstructor({
                      id: instructor.id,
                      name: instructor.name,
                    })
                  }
                />
              ) : (
                <h5>
                  {language === "ja"
                    ? "予約可能なクラスがありません"
                    : "No bookable classes"}
                </h5>
              )}
            </div>
          );
        })}
      </div>

      <ActionButton
        btnText={language === "ja" ? "戻る" : "Back"}
        className="back"
        onClick={() => setRebookingStep(previousRebookingStep)}
      />
    </div>
  );
}

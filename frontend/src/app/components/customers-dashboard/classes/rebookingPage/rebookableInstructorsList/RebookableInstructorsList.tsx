"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookableInstructorsList.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatYearDateTime } from "@/app/helper/utils/dateUtils";

export default function RebookableInstructorsList({
  instructorProfiles,
  instructorAvailabilities,
  setInstructorToRebook,
  rebookingOption,
  setRebookingStep,
  dateTimeToRebook,
}: RebookableInstructorsListProps) {
  const { language } = useLanguage();

  const previousRebookingStep =
    rebookingOption === "instructor" ? "selectOption" : "selectDateTime";

  const nextRebookingStep =
    rebookingOption === "instructor" ? "selectDateTime" : "confirmRebooking";

  let rebookableInstructorIds: number[];

  if (rebookingOption === "instructor") {
    rebookableInstructorIds = [
      ...new Set(instructorAvailabilities.map((a) => a.instructorId)),
    ];
  } else if (rebookingOption === "dateTime") {
    rebookableInstructorIds = instructorAvailabilities
      .filter((a) => a.dateTime === dateTimeToRebook)
      .map((a) => a.instructorId);
  }

  const selectInstructor = ({ id, name }: { id: number; name: string }) => {
    setInstructorToRebook({ id, name });
    setRebookingStep(nextRebookingStep);
  };

  return (
    <>
      {rebookingOption === "dateTime" && (
        <div className={styles.dateTime}>
          {formatYearDateTime(
            new Date(dateTimeToRebook!),
            language === "ja" ? "ja-JP" : "en-US",
          )}
        </div>
      )}
      <div className={styles.instructorsList}>
        {instructorProfiles.map((instructor) => {
          const isRebookable = rebookableInstructorIds.includes(instructor.id);
          return (
            <div
              key={instructor.id}
              className={`${styles.instructor} ${!isRebookable ? styles["instructor--notRebookable"] : ""} `}
            >
              <div className={styles.instructor__name}>{instructor.name}</div>

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
    </>
  );
}

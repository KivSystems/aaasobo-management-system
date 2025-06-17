"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookableTimeSlots.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatDateTime } from "@/app/helper/utils/dateUtils";

export default function RebookableTimeSlots({
  setDateTimeToRebook,
  setRebookingStep,
  instructorToRebook,
  instructorAvailabilities,
  rebookingOption,
}: RebookableTimeSlotsProps) {
  const { language } = useLanguage();

  const previousRebookingStep =
    rebookingOption === "instructor" ? "selectInstructor" : "selectOption";

  const nextRebookingStep =
    rebookingOption === "instructor" ? "confirmRebooking" : "selectInstructor";

  let rebookableTimeSlots;

  if (rebookingOption === "instructor") {
    const selectedInstructorAvailabilities = instructorAvailabilities
      .filter((a) => a.instructorId === instructorToRebook.id)
      .map((a) => a.dateTime);

    rebookableTimeSlots = selectedInstructorAvailabilities.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  } else if (rebookingOption === "dateTime") {
    const instructorAvailableTimeSlots = instructorAvailabilities
      .map((a) => a.dateTime)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    rebookableTimeSlots = [...new Set(instructorAvailableTimeSlots)];
  }

  const selectDateTime = (dateTime: string) => {
    setDateTimeToRebook(dateTime);
    setRebookingStep(nextRebookingStep);
  };

  return (
    <div className={styles.dateTimes}>
      {rebookingOption === "instructor" && (
        <div className={styles.dateTimes__instructor}>
          {instructorToRebook.name}
        </div>
      )}

      <div className={styles.dateTimes__list}>
        {rebookableTimeSlots?.map((s, i) => {
          return (
            <ActionButton
              key={i}
              btnText={formatDateTime(
                new Date(s),
                language === "ja" ? "ja-JP" : "en-US",
              )}
              className="bookBtn"
              onClick={() => selectDateTime(s)}
            />
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

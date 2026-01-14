"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookableInstructorsList.module.scss";
import {
  formatTimeWithAddedMinutes,
  formatYearDateTime,
} from "@/app/helper/utils/dateUtils";
import { useMemo } from "react";
import StepIndicator from "@/app/components/elements/stepIndicator/StepIndicator";
import RebookableInstructorItem from "./rebookableInstructorItem/RebookableInstructorItem";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

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

  const currentStep: number = rebookingOption === "instructor" ? 1 : 2;

  const rebookableInstructorIds = useMemo(() => {
    if (rebookingOption === "instructor") {
      return [
        ...new Set(
          instructorAvailabilities.flatMap((a) => a.availableInstructors),
        ),
      ];
    }
    if (rebookingOption === "dateTime") {
      return instructorAvailabilities
        .filter((a) => a.dateTime === dateTimeToRebook)
        .flatMap((a) => a.availableInstructors);
    }
    return [];
  }, [rebookingOption, instructorAvailabilities, dateTimeToRebook]);

  const selectInstructor = (instructor: InstructorRebookingProfile) => {
    setInstructorToRebook(instructor);
    setRebookingStep(nextRebookingStep);
  };

  return (
    <div className={styles.rebookableInstructors}>
      <StepIndicator currentStep={currentStep} totalSteps={3} />

      {rebookingOption === "dateTime" && (
        <div className={styles.rebookableInstructors__dateTime}>
          <CalendarDaysIcon className={styles.rebookableInstructors__icon} />
          {`${formatYearDateTime(
            new Date(dateTimeToRebook!),
            language === "ja" ? "ja-JP" : "en-US",
          )} - 
          ${formatTimeWithAddedMinutes(new Date(dateTimeToRebook!), 25)}`}
        </div>
      )}
      <div className={styles.rebookableInstructors__list}>
        {instructorProfiles.map((instructor) => {
          const isRebookable = rebookableInstructorIds.includes(instructor.id);
          return (
            <RebookableInstructorItem
              key={instructor.id}
              instructor={instructor}
              isRebookable={isRebookable}
              language={language}
              onSelect={selectInstructor}
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

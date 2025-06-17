"use client";

import { useState } from "react";
import styles from "./RebookingForm.module.scss";
import RebookingOptions from "../rebookingOptions/RebookingOptions";
import RebookableInstructorsList from "../rebookableInstructorsList/RebookableInstructorsList";
import RebookableTimeSlots from "../rebookableTimeSlots/RebookableTimeSlots";
import ConfirmRebooking from "../confirmRebooking/ConfirmRebooking";

export default function RebookingForm({
  customerId,
  classId,
  instructorAvailabilities,
  instructorProfiles,
  childProfiles,
  isAdminAuthenticated,
}: RebookingFormProps) {
  const [rebookingStep, setRebookingStep] =
    useState<RebookingSteps>("selectOption");
  const [rebookingOption, setRebookingOption] = useState<
    "instructor" | "dateTime" | null
  >(null);
  const [instructorToRebook, setInstructorToRebook] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [dateTimeToRebook, setDateTimeToRebook] = useState<string | null>(null);

  const selectOption = (option: "instructor" | "dateTime") => {
    setRebookingOption(option);
    const rebookingStep =
      option === "instructor" ? "selectInstructor" : "selectDateTime";
    setRebookingStep(rebookingStep);
  };

  return (
    <div className={styles.rebookingForm}>
      {rebookingStep === "selectOption" && (
        <RebookingOptions selectOption={selectOption} />
      )}

      {rebookingStep === "selectInstructor" && (
        <RebookableInstructorsList
          instructorProfiles={instructorProfiles}
          instructorAvailabilities={instructorAvailabilities}
          setInstructorToRebook={setInstructorToRebook}
          rebookingOption={rebookingOption!}
          setRebookingStep={setRebookingStep}
          dateTimeToRebook={dateTimeToRebook}
        />
      )}

      {rebookingStep === "selectDateTime" && (
        <RebookableTimeSlots
          setDateTimeToRebook={setDateTimeToRebook}
          setRebookingStep={setRebookingStep}
          instructorToRebook={instructorToRebook!}
          instructorAvailabilities={instructorAvailabilities}
          rebookingOption={rebookingOption!}
        />
      )}

      {rebookingStep === "confirmRebooking" && (
        <ConfirmRebooking
          instructorToRebook={instructorToRebook!}
          dateTimeToRebook={dateTimeToRebook!}
          rebookingOption={rebookingOption!}
          setRebookingStep={setRebookingStep}
          childProfiles={childProfiles}
          customerId={customerId}
          classId={classId}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      )}
    </div>
  );
}

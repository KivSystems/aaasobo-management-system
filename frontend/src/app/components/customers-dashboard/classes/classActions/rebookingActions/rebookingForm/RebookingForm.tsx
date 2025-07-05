"use client";

import { useEffect, useState } from "react";
import styles from "./RebookingForm.module.scss";
import RebookingOptions from "./rebookingOptions/RebookingOptions";
import RebookableInstructorsList from "./rebookableInstructorsList/RebookableInstructorsList";
import RebookableTimeSlots from "./rebookableTimeSlots/RebookableTimeSlots";
import ConfirmRebooking from "./confirmRebooking/ConfirmRebooking";
import RebookableClassesList from "./rebookableClassesList/RebookableClassesList";
import { getInstructorAvailabilities } from "@/app/helper/api/classesApi";
import Loading from "@/app/components/elements/loading/Loading";
import RebookingCompleteMessage from "./rebookingCompleteMessage/RebookingCompleteMessage";

export default function RebookingForm({
  customerId,
  rebookableClasses,
  instructorProfiles,
  childProfiles,
  isAdminAuthenticated,
}: RebookingFormProps) {
  const [instructorAvailabilities, setInstructorAvailabilities] = useState<
    InstructorAvailability[] | []
  >([]);
  const [rebookingStep, setRebookingStep] =
    useState<RebookingSteps>("selectClass");
  const [rebookingOption, setRebookingOption] = useState<
    "instructor" | "dateTime" | null
  >(null);
  const [classToRebook, setClassToRebook] = useState<number | null>(null);
  const [instructorToRebook, setInstructorToRebook] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [dateTimeToRebook, setDateTimeToRebook] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!classToRebook) return;

    const fetchInstructorAvailabilities = async () => {
      const instructorAvailabilities =
        await getInstructorAvailabilities(classToRebook);
      setInstructorAvailabilities(instructorAvailabilities);
    };
    setIsLoading(true);
    fetchInstructorAvailabilities();
    setIsLoading(false);
  }, [classToRebook]);

  const selectOption = (option: "instructor" | "dateTime") => {
    setRebookingOption(option);
    const rebookingStep =
      option === "instructor" ? "selectInstructor" : "selectDateTime";
    setRebookingStep(rebookingStep);
  };

  return (
    <div className={styles.rebookingForm}>
      <div className={styles.loadingWrapper}>
        {isLoading && <Loading className="rebooking" />}
      </div>

      {rebookingStep === "selectClass" && (
        <RebookableClassesList
          customerId={customerId}
          rebookableClasses={rebookableClasses}
          setClassToRebook={setClassToRebook}
          setRebookingStep={setRebookingStep}
        />
      )}

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
          classId={classToRebook!}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      )}

      {rebookingStep === "complete" && (
        <RebookingCompleteMessage
          rebookableClasses={rebookableClasses}
          setRebookingStep={setRebookingStep}
        />
      )}
    </div>
  );
}

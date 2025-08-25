"use client";

import { useEffect, useState } from "react";
import styles from "./RebookingForm.module.scss";
import RebookingOptions from "./rebookingOptions/RebookingOptions";
import RebookableInstructorsList from "./rebookableInstructorsList/RebookableInstructorsList";
import RebookableTimeSlots from "./rebookableTimeSlots/RebookableTimeSlots";
import ConfirmRebooking from "./confirmRebooking/ConfirmRebooking";
import RebookableClassesList from "./rebookableClassesList/RebookableClassesList";
import { getAllInstructorAvailableSlots } from "@/app/helper/api/instructorsApi";
import Loading from "@/app/components/elements/loading/Loading";
import RebookingCompleteMessage from "./rebookingCompleteMessage/RebookingCompleteMessage";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { nHoursLater } from "@/app/helper/utils/dateUtils";

export default function RebookingForm({
  customerId,
  rebookableClasses,
  instructorProfiles,
  childProfiles,
  userSessionType,
}: RebookingFormProps) {
  const [instructorAvailabilities, setInstructorAvailabilities] = useState<
    { dateTime: string; availableInstructors: number[] }[] | []
  >([]);
  const [rebookingStep, setRebookingStep] =
    useState<RebookingSteps>("selectClass");
  const [rebookingOption, setRebookingOption] = useState<
    "instructor" | "dateTime" | null
  >(null);
  const [classToRebook, setClassToRebook] = useState<number | null>(null);
  const [instructorToRebook, setInstructorToRebook] =
    useState<InstructorRebookingProfile | null>(null);
  const [dateTimeToRebook, setDateTimeToRebook] = useState<string | null>(null);
  const [rebookableClassesNumber, setRebookableClassesNumber] =
    useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const { language } = useLanguage();

  useEffect(() => {
    if (!classToRebook) return;

    const fetchInstructorAvailabilities = async () => {
      // Get date range for next 30 days for rebooking
      const REGULAR_REBOOKING_HOURS = 3;
      const INSTRUCTOR_AVAILABILITY_WINDOW_HOURS = 30 * 24;
      const startDate = nHoursLater(REGULAR_REBOOKING_HOURS);
      const endDate = nHoursLater(INSTRUCTOR_AVAILABILITY_WINDOW_HOURS);

      const result = await getAllInstructorAvailableSlots(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      );

      if ("data" in result) {
        setInstructorAvailabilities(result.data);
      }
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
          language={language}
          userSessionType={userSessionType}
          childProfiles={childProfiles}
        />
      )}

      {rebookingStep === "selectOption" && (
        <RebookingOptions
          selectOption={selectOption}
          setRebookingStep={setRebookingStep}
          language={language}
        />
      )}

      {rebookingStep === "selectInstructor" && (
        <RebookableInstructorsList
          instructorProfiles={instructorProfiles}
          instructorAvailabilities={instructorAvailabilities}
          setInstructorToRebook={setInstructorToRebook}
          rebookingOption={rebookingOption!}
          setRebookingStep={setRebookingStep}
          dateTimeToRebook={dateTimeToRebook}
          language={language}
        />
      )}

      {rebookingStep === "selectDateTime" && (
        <RebookableTimeSlots
          setDateTimeToRebook={setDateTimeToRebook}
          setRebookingStep={setRebookingStep}
          instructorToRebook={instructorToRebook!}
          instructorAvailabilities={instructorAvailabilities}
          rebookingOption={rebookingOption!}
          language={language}
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
          rebookableClasses={rebookableClasses}
          setRebookableClassesNumber={setRebookableClassesNumber}
          classId={classToRebook!}
          userSessionType={userSessionType}
          language={language}
        />
      )}

      {rebookingStep === "complete" && (
        <RebookingCompleteMessage
          rebookableClassesNumber={rebookableClassesNumber}
          setRebookingStep={setRebookingStep}
          language={language}
        />
      )}
    </div>
  );
}

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
import { useLanguage } from "@/app/contexts/LanguageContext";

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
          language={language}
          isAdminAuthenticated={isAdminAuthenticated}
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
          isAdminAuthenticated={isAdminAuthenticated}
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

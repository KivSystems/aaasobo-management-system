"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./RebookableTimeSlots.module.scss";
import { useMemo } from "react";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import HorizontalScroller from "@/app/components/elements/horizontalScroller/HorizontalScroller";
import StepIndicator from "@/app/components/elements/stepIndicator/StepIndicator";
import ClassInstructor from "@/app/components/features/classDetail/classInstructor/ClassInstructor";

export default function RebookableTimeSlots({
  setDateTimeToRebook,
  setRebookingStep,
  instructorToRebook,
  instructorAvailabilities,
  rebookingOption,
  language,
}: RebookableTimeSlotsProps) {
  const previousRebookingStep =
    rebookingOption === "instructor" ? "selectInstructor" : "selectOption";

  const nextRebookingStep =
    rebookingOption === "instructor" ? "confirmRebooking" : "selectInstructor";

  const currentStep: number = rebookingOption === "instructor" ? 2 : 1;

  const rebookableTimeSlots = useMemo(() => {
    if (rebookingOption === "instructor") {
      return instructorAvailabilities
        .filter((a) => a.availableInstructors.includes(instructorToRebook.id))
        .map((a) => a.dateTime)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else if (rebookingOption === "dateTime") {
      return [
        ...new Set(
          instructorAvailabilities
            .map((a) => a.dateTime)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
        ),
      ];
    }
    return [];
  }, [instructorAvailabilities, instructorToRebook, rebookingOption]);

  const selectDateTime = (dateTime: string) => {
    setDateTimeToRebook(dateTime);
    setRebookingStep(nextRebookingStep);
  };

  const groupSlotsByDay = (slots: string[]) => {
    const grouped: Record<string, string[]> = {};

    slots.forEach((slot) => {
      const date = format(new Date(slot), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };
  const groupedSlots = groupSlotsByDay(rebookableTimeSlots);
  const weekDates = Object.keys(groupedSlots);

  return (
    <div className={styles.rebookableSlots}>
      {instructorAvailabilities.length === 0 ? (
        <p className={styles.noInstructorMessage}>
          {language === "ja"
            ? "予約可能なクラスがありません。"
            : "No classes available for booking."}
        </p>
      ) : (
        <>
          <StepIndicator currentStep={currentStep} totalSteps={3} />

          {rebookingOption === "instructor" && (
            <ClassInstructor
              classStatus={"freeTrial"}
              instructorIcon={instructorToRebook.icon}
              instructorNickname={instructorToRebook.nickname}
              width={100}
              className="rebookingModal"
            />
          )}

          <HorizontalScroller>
            <div className={styles.scroller}>
              <div className={styles.headerRow}>
                {weekDates.map((date) => {
                  const locale = language === "ja" ? ja : enUS;
                  const formattedDay = format(
                    new Date(`${date}T00:00:00`),
                    "EEE",
                    {
                      locale,
                    },
                  );
                  const formattedDate =
                    language === "ja"
                      ? format(new Date(`${date}T00:00:00`), "M/d", { locale })
                      : format(new Date(`${date}T00:00:00`), "MMM d", {
                          locale,
                        });

                  return (
                    <div key={date} className={styles.dayHeader}>
                      <div className={styles.dayHeader__date}>
                        {formattedDate}
                      </div>
                      <div className={styles.dayHeader__day}>
                        {formattedDay}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.slotRow}>
                {weekDates.map((date) => (
                  <div key={date} className={styles.dayColumn}>
                    {groupedSlots[date].map((slot) => (
                      <ActionButton
                        key={slot}
                        btnText={format(new Date(slot), "H:mm")}
                        className="timeSlotBtn"
                        onClick={() => selectDateTime(slot)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </HorizontalScroller>
        </>
      )}

      <ActionButton
        btnText={language === "ja" ? "戻る" : "Back"}
        className="back"
        onClick={() => setRebookingStep(previousRebookingStep)}
      />
    </div>
  );
}

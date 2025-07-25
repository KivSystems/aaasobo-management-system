"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./ConfirmRebooking.module.scss";
import {
  formatTimeWithAddedMinutes,
  formatYearDateTime,
} from "@/app/helper/utils/dateUtils";
import { useEffect, useState } from "react";
import {
  CONFIRM_BOOKING_WITH_CONFLICT_MESSAGE,
  DOUBLE_BOOKING_CONFIRMATION_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
  SELECT_AT_LEAST_ONE_CHILD_MESSAGE,
} from "@/app/helper/messages/customerDashboard";
import Loading from "@/app/components/elements/loading/Loading";
import CheckboxInput from "@/app/components/elements/checkboxInput/CheckboxInput";
import {
  checkChildConflicts,
  checkDoubleBooking,
} from "@/app/helper/api/classesApi";
import { rebookClassWithValidation } from "@/app/actions/rebooking";
import ClassInstructor from "@/app/components/features/classDetail/classInstructor/ClassInstructor";
import { CalendarDaysIcon, UsersIcon } from "@heroicons/react/24/solid";
import StepIndicator from "@/app/components/elements/stepIndicator/StepIndicator";

export default function ConfirmRebooking({
  instructorToRebook,
  dateTimeToRebook,
  rebookingOption,
  setRebookingStep,
  childProfiles,
  customerId,
  classId,
  rebookableClasses,
  setRebookableClassesNumber,
  isAdminAuthenticated,
  language,
}: ConfirmRebookingProps) {
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[] | []>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const previousRebookingStep =
    rebookingOption === "instructor" ? "selectDateTime" : "selectInstructor";

  useEffect(() => {
    const initialIds = childProfiles.map((child) => child.id);
    setSelectedChildrenIds(initialIds);
  }, [childProfiles]);

  const handleChildChange = (changedChildId: number) => {
    setSelectedChildrenIds((prev: number[]) => {
      const updated = prev.filter((id) => id !== changedChildId);
      if (updated.length === prev.length) {
        updated.push(changedChildId);
      }
      return updated;
    });
  };

  const handleRebooking = async () => {
    setIsLoading(true);

    const currentRebookableClassesNumber = rebookableClasses.length;

    if (selectedChildrenIds.length === 0) {
      alert(SELECT_AT_LEAST_ONE_CHILD_MESSAGE[language]);
      setIsLoading(false);
      return;
    }

    // Check if any of the selected children already have a class booked with a different instructor at the same time
    const conflictsResult = await checkChildConflicts(
      dateTimeToRebook,
      selectedChildrenIds,
    );

    if ("message" in conflictsResult) {
      setIsLoading(false);
      return alert(conflictsResult.message[language]);
    }

    if (conflictsResult.conflictingChildren.length > 0) {
      const conflictingChildren =
        conflictsResult.conflictingChildren.join(", ");
      const userConfirmed = window.confirm(
        `${CONFIRM_BOOKING_WITH_CONFLICT_MESSAGE[language]}\n${conflictingChildren}`,
      );
      if (!userConfirmed) {
        setIsLoading(false);
        return;
      }
    }

    // Check if there is already a booked class for this customer at the same time
    const doubleBookingResult = await checkDoubleBooking(
      customerId,
      dateTimeToRebook,
    );

    if ("message" in doubleBookingResult) {
      setIsLoading(false);
      return alert(doubleBookingResult.message[language]);
    }

    if (doubleBookingResult.isDoubleBooked) {
      const userConfirmed = window.confirm(
        DOUBLE_BOOKING_CONFIRMATION_MESSAGE[language],
      );
      if (!userConfirmed) {
        setIsLoading(false);
        return;
      }
    }

    const result = await rebookClassWithValidation({
      customerId,
      classId,
      dateTime: dateTimeToRebook,
      instructorId: instructorToRebook.id,
      childrenIds: selectedChildrenIds,
      isAdminAuthenticated,
      language,
    });

    if (result.error) {
      alert(
        result.error === "unauthorized"
          ? LOGIN_REQUIRED_MESSAGE[language]
          : result.error,
      );
      setIsLoading(false);
      return;
    }

    // Decrease the number of rebookable classes by one after successful rebooking
    setRebookableClassesNumber(currentRebookableClassesNumber - 1);

    setIsLoading(false);
    setRebookingStep("complete");
  };

  return (
    <div className={styles.rebookingConfirm}>
      <StepIndicator currentStep={3} totalSteps={3} />

      <div className={styles.rebookingConfirm__container}>
        <ClassInstructor
          classStatus={"freeTrial"}
          instructorIcon={instructorToRebook.icon}
          instructorNickname={instructorToRebook.nickname}
          width={120}
          className="rebookingModal"
        />

        <div className={styles.rebookingConfirm__dateTime}>
          <CalendarDaysIcon className={styles.rebookingConfirm__icon} />
          {`${formatYearDateTime(
            new Date(dateTimeToRebook!),
            language === "ja" ? "ja-JP" : "en-US",
          )} - 
          ${formatTimeWithAddedMinutes(new Date(dateTimeToRebook!), 25)}`}
        </div>

        <div className={styles.rebookingConfirm__children}>
          <div className={styles.rebookingConfirm__title}>
            <UsersIcon className={styles.rebookingConfirm__icon} />
            <p>
              {language === "ja" ? "参加されるお子さま" : "Attending children"}
            </p>
          </div>
          <div className={styles.rebookingConfirm__attendingChildren}>
            {childProfiles.map((child) => (
              <CheckboxInput
                key={child.id}
                label={child.name}
                checked={selectedChildrenIds.some((id) => id === child.id)}
                onChange={(event) => handleChildChange(child.id)}
              />
            ))}
          </div>
        </div>

        <div className={styles.rebookingConfirm__loading}>
          {isLoading && <Loading className="rebooking" />}
        </div>
      </div>

      <div className={styles.rebookingConfirm__buttons}>
        <ActionButton
          btnText={language === "ja" ? "戻る" : "Back"}
          className="back"
          onClick={() => setRebookingStep(previousRebookingStep)}
          disabled={isLoading}
        />

        <ActionButton
          btnText={language === "ja" ? "クラスを予約" : "Book Class"}
          className="bookBtn"
          onClick={() => handleRebooking()}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./ConfirmRebooking.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatYearDateTime } from "@/app/helper/utils/dateUtils";
import { useEffect, useState } from "react";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
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
  rebookClass,
} from "@/app/helper/api/classesApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

export default function ConfirmRebooking({
  instructorToRebook,
  dateTimeToRebook,
  rebookingOption,
  setRebookingStep,
  childProfiles,
  customerId,
  classId,
  isAdminAuthenticated,
}: ConfirmRebookingProps) {
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[] | []>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

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

    // Check if the user is authenticated to rebook a class
    const session = await getUserSession();
    if (!session) {
      alert(LOGIN_REQUIRED_MESSAGE[language]);
      setIsLoading(false);
      return;
    }

    let adminId;

    if (session.user.userType === "customer") {
      if (Number(session.user.id) !== customerId) {
        alert(LOGIN_REQUIRED_MESSAGE[language]);
        setIsLoading(false);
        return;
      }
    } else if (session.user.userType === "admin") {
      adminId = Number(session.user.id);
      if (!adminId && isAdminAuthenticated) {
        alert("Admin ID is required for authenticated admin actions.");
        setIsLoading(false);
        return;
      }
    } else {
      alert(LOGIN_REQUIRED_MESSAGE[language]);
      setIsLoading(false);
      return;
    }

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

    // Proceed with rebooking
    const rebookingResult = await rebookClass(classId, {
      dateTime: dateTimeToRebook,
      instructorId: instructorToRebook.id,
      customerId,
      childrenIds: selectedChildrenIds,
    });

    if ("errorMessage" in rebookingResult) {
      return alert(rebookingResult.errorMessage[language]);
    }

    await revalidateCustomerCalendar(customerId, isAdminAuthenticated);

    setIsLoading(false);

    setRebookingStep("complete");
  };

  return (
    <div className={styles.confirm}>
      <div className={styles.confirm__instructor}>
        {instructorToRebook.name}
      </div>

      <div className={styles.confirm__dateTime}>
        {formatYearDateTime(
          new Date(dateTimeToRebook),
          language === "ja" ? "ja-JP" : "en-US",
        )}
      </div>

      <div className={styles.attendingChildren}>
        {childProfiles.map((child) => (
          <CheckboxInput
            key={child.id}
            label={child.name}
            checked={selectedChildrenIds.some((id) => id === child.id)}
            onChange={(event) => handleChildChange(child.id)}
          />
        ))}
      </div>

      <div className={styles.loadingWrapper}>
        {isLoading && <Loading className="rebooking" />}
      </div>

      <div className={styles.buttons}>
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

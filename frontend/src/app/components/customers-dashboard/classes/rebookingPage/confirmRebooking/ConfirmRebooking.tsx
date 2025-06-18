"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./ConfirmRebooking.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatYearDateTime } from "@/app/helper/utils/dateUtils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { useRouter } from "next/navigation";
import {
  CONFIRM_BOOKING_WITH_CONFLICT_MESSAGE,
  DOUBLE_BOOKING_CONFIRMATION_MESSAGE,
  SELECT_AT_LEAST_ONE_CHILD_MESSAGE,
} from "@/app/helper/messages/customerDashboard";
import {
  checkChildConflictsAction,
  checkDoubleBookingAction,
  rebookClassAction,
} from "@/app/actions/rebookingActions";
import Loading from "@/app/components/elements/loading/Loading";

export default function ConfirmRebooking({
  instructorToRebook,
  dateTimeToRebook,
  rebookingOption,
  setRebookingStep,
  childProfiles,
  customerId,
  classId,
  adminId,
  isAdminAuthenticated,
}: ConfirmRebookingProps) {
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[] | []>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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

    if (selectedChildrenIds.length === 0) {
      alert(SELECT_AT_LEAST_ONE_CHILD_MESSAGE[language]);
      setIsLoading(false);
      return;
    }

    // Check if any of the selected children already have a class booked with a different instructor at the same time
    const conflictsResult = await checkChildConflictsAction(
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
    const doubleBookingResult = await checkDoubleBookingAction(
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
    const rebookingResult = await rebookClassAction(classId, {
      dateTime: dateTimeToRebook,
      instructorId: instructorToRebook.id,
      customerId,
      childrenIds: selectedChildrenIds,
    });

    setIsLoading(false);

    if ("errorMessage" in rebookingResult) {
      return alert(rebookingResult.errorMessage[language]);
    }

    toast.success(rebookingResult.successMessage[language]);

    await revalidateCustomerCalendar(customerId, isAdminAuthenticated);

    // TODO: handle same-day rebooking and send a notification to admins via email

    const pathToPush = isAdminAuthenticated
      ? `/admins/${adminId}/customer-list/${customerId}`
      : `/customers/${customerId}/classes`;

    router.push(pathToPush);
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

      <div className={styles.inputWrapper}>
        {childProfiles.map((child) => (
          <div key={child.id} className={styles.field}>
            <label>
              <input
                type="checkbox"
                checked={selectedChildrenIds.some((id) => id === child.id)}
                onChange={(event) => handleChildChange(child.id)}
                className={styles.checkbox}
              />
              {child.name}
            </label>
          </div>
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

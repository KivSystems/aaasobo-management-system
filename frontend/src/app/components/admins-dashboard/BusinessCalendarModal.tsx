"use client";

import styles from "./BusinessCalendarModal.module.scss";
import InputField from "@/app/components/elements/inputField/InputField";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import {
  CheckIcon,
  CalendarDaysIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const BusinessCalendarModal = ({
  selectedDates,
  events,
  localMessages,
}: {
  selectedDates: string[];
  events: BusinessEventType[];
  localMessages: UpdateFormState;
}) => {
  return (
    <div className={styles.modalContent}>
      <h2>Schedule Update</h2>
      {selectedDates && (
        <>
          <InputField name="startDate" value={selectedDates[0]} type="hidden" />
          <InputField name="endDate" value={selectedDates[1]} type="hidden" />
          <div className={styles.dateInfo}>
            <CalendarDaysIcon className={styles.icon} />
            <p>
              {selectedDates.length === 1
                ? `${selectedDates[0]}`
                : `${selectedDates[0]} - ${selectedDates[1]}`}
            </p>
          </div>
          <div className={styles.eventSelector}>
            <BellIcon className={styles.icon} />
            <select name="eventId" className={styles.eventSelect}>
              <option value="default">Select Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actionButton}>
            <ActionButton
              className="saveEvent"
              btnText="Update"
              type="submit"
              Icon={CheckIcon}
            />
          </div>
          {localMessages.eventId && (
            <FormValidationMessage
              type="error"
              message={localMessages.eventId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BusinessCalendarModal;

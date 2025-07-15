"use client";

import InputField from "@/app/components/elements/inputField/InputField";
import FormValidationMessage from "@/app/components/elements/formValidationMessage/FormValidationMessage";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { CheckIcon } from "@heroicons/react/24/outline";

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
    <>
      <h2>Schedule Update</h2>
      {selectedDates && (
        <>
          <p>
            {selectedDates.length === 1
              ? selectedDates[0]
              : `${selectedDates[0]} - ${selectedDates[1]}`}
          </p>
          <InputField name="startDate" value={selectedDates[0]} type="hidden" />
          <InputField name="endDate" value={selectedDates[1]} type="hidden" />
          <select name="eventId">
            <option value="default">Select Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          {localMessages.eventId && (
            <FormValidationMessage
              type="error"
              message={localMessages.eventId}
            />
          )}
          <ActionButton
            className="saveEvent"
            btnText="Update"
            type="submit"
            Icon={CheckIcon}
          />
        </>
      )}
    </>
  );
};

export default BusinessCalendarModal;

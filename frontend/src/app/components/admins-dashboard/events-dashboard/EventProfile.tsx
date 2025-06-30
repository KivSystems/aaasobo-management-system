"use client";

import styles from "./EventProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
// TODO: Uncomment the import when the updateData action is implemented
// import { updateData } from "@/app/actions/updateData";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  CalendarIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/elements/loading/Loading";

function EventProfile({
  event,
  isAdminAuthenticated,
}: {
  event: EventType | string;
  isAdminAuthenticated?: boolean;
}) {
  // TODO: Uncomment the import when the updateEventAction action is implemented
  // const [updateResultState, formAction] = useFormState(updateEventAction, {});
  const [previousEvent, setPreviousEvent] = useState<EventType | null>(
    typeof event !== "string" ? event : null,
  );
  const [latestEvent, setLatestEvent] = useState<EventType | null>(
    typeof event !== "string" ? event : null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof EventType,
  ) => {
    if (latestEvent) {
      setLatestEvent({ ...latestEvent, [field]: e.target.value });
    }
  };

  const handleCancelClick = () => {
    if (latestEvent) {
      setLatestEvent(previousEvent);
      setIsEditing(false);
    }
  };

  // TODO: Uncomment the useEffect when the updateResultState is available
  // useEffect(() => {
  //   if (updateResultState !== undefined) {
  //     if ("event" in updateResultState) {
  //       const result = updateResultState as { event: Event };
  //       toast.success("Profile updated successfully!");
  //       setIsEditing(false);
  //       setPreviousEvent(result.event);
  //       setLatestEvent(result.event);
  //     } else {
  //       const result = updateResultState as { errorMessage: string };
  //       toast.error(result.errorMessage);
  //     }
  //   }
  // }, [updateResultState]);

  if (typeof event === "string") {
    return <p>{event}</p>;
  }

  return (
    <>
      <div className={styles.container}>
        {latestEvent ? (
          // TODO: Uncomment the formAction when the updateEventAction action is implemented
          // <form action={formAction} className={styles.profileCard}>
          <div className={styles.profileCard}>
            {/* Event name */}
            <div className={styles.eventName__nameSection}>
              <p className={styles.eventName__text}>Event</p>
              {isEditing ? (
                <InputField
                  name="name"
                  value={latestEvent.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className={`${styles.eventName__inputField} ${isEditing ? styles.editable : ""}`}
                />
              ) : (
                <h3 className={styles.eventName__name}>{latestEvent.name}</h3>
              )}
            </div>

            {/* Color */}
            <div className={styles.insideContainer}>
              <PencilIcon className={styles.icon} />
              <div>
                <p className={styles.eventName__text}>Color</p>
                {isEditing ? (
                  <InputField
                    name="color"
                    value={latestEvent.color.toUpperCase()}
                    onChange={(e) => handleInputChange(e, "color")}
                    className={`${styles.eventColor__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <div className={styles.eventColor}>
                    <div
                      className={styles.eventColor__colorBox}
                      style={{
                        backgroundColor: latestEvent.color,
                      }}
                    />
                    <h4>{latestEvent.color.toUpperCase()}</h4>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden input field */}
            <input type="hidden" name="id" value={latestEvent.id} />

            {/* Action buttons for only admin */}
            {isAdminAuthenticated ? (
              <>
                {isEditing ? (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="cancelEditingInstructor"
                      btnText="Cancel"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelClick();
                      }}
                    />

                    <ActionButton
                      className="saveInstructor"
                      btnText="Save"
                      type="submit"
                      Icon={CheckIcon}
                    />
                  </div>
                ) : (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="editInstructor"
                      btnText="Edit"
                      onClick={handleEditClick}
                    />
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default EventProfile;

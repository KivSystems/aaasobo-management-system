"use client";

import { useState, useCallback } from "react";
import {
  getInstructorAvailableSlots,
  getInstructorAbsences,
} from "@/app/helper/api/instructorsApi";
import {
  batchUpdateInstructorAbsences,
  type AbsenceChange,
} from "@/app/actions/instructorAbsence";
import Calendar from "@/app/components/features/calendar/Calendar";
import Modal from "@/app/components/elements/modal/Modal";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { EventSourceFuncArg, EventClickArg } from "@fullcalendar/core";
import { toast } from "react-toastify";
import styles from "./AvailabilityCalendar.module.scss";

// Define proper event type for FullCalendar events
interface CalendarEvent {
  id: string;
  start: string;
  end: string;
  title: string;
  color: string;
  textColor: string;
  extendedProps: {
    type: "available" | "absence";
    hasPendingChange: boolean;
    changeType: "toRemove";
  };
}

export default function AvailabilityCalendar({
  instructorId,
}: {
  instructorId: number;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalRefreshKey, setModalRefreshKey] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, AbsenceChange>
  >(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatJSTDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const refreshCalendars = () => {
    setRefreshKey((prev) => prev + 1);
    setModalRefreshKey((prev) => prev + 1);
  };

  const fetchCalendarEvents = useCallback(
    async (info: EventSourceFuncArg) => {
      const startStr = formatJSTDate(info.start);
      const endDate = new Date(info.end);
      endDate.setDate(endDate.getDate() + 1);
      const endStr = formatJSTDate(endDate);

      try {
        // Fetch both available slots and absences in parallel
        const [slotsResponse, absencesResponse] = await Promise.all([
          getInstructorAvailableSlots(instructorId, startStr, endStr, false),
          getInstructorAbsences(instructorId),
        ]);

        const events: CalendarEvent[] = [];

        // Add available slots (green)
        if ("data" in slotsResponse) {
          const availableEvents = slotsResponse.data.map(
            (slot): CalendarEvent => {
              const start = slot.dateTime;
              const end = new Date(
                new Date(start).getTime() + 25 * 60000,
              ).toISOString();

              // Check if this slot has pending changes
              const pendingChange = pendingChanges.get(start);

              return {
                id: `available-${start}`,
                start,
                end,
                title: "Available",
                color: "#A2B098",
                textColor: "#FFF",
                extendedProps: {
                  type: "available" as const,
                  hasPendingChange: pendingChange?.action === "add",
                  changeType: "toRemove" as const,
                },
              };
            },
          );
          events.push(...availableEvents);
        }

        // Add absences (red) - filter to current view range
        if ("absences" in absencesResponse) {
          const absenceEvents = absencesResponse.absences
            .filter((absence) => {
              const absenceDate = new Date(absence.absentAt);
              return absenceDate >= info.start && absenceDate < info.end;
            })
            .map((absence): CalendarEvent => {
              const start = absence.absentAt;
              const end = new Date(
                new Date(start).getTime() + 25 * 60000,
              ).toISOString();

              // Check if this absence has pending changes
              const pendingChange = pendingChanges.get(start);

              return {
                id: `absence-${start}`,
                start,
                end,
                title: "Absent",
                color: "#DC2626",
                textColor: "#FFF",
                extendedProps: {
                  type: "absence" as const,
                  hasPendingChange: pendingChange?.action === "remove",
                  changeType: "toRemove" as const,
                },
              };
            });
          events.push(...absenceEvents);
        }

        return events;
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        return [];
      }
    },
    [instructorId, pendingChanges],
  );

  const handleBatchSubmit = async () => {
    if (pendingChanges.size === 0) return;

    setIsSubmitting(true);

    try {
      // Convert pending changes to array format
      const changes: AbsenceChange[] = Array.from(pendingChanges.values());

      const result = await batchUpdateInstructorAbsences(instructorId, changes);

      if (result.success) {
        // All changes successful
        setPendingChanges(new Map());
        refreshCalendars();
        setIsEditModalOpen(false);
        // Show success message only if there were actual changes
        if (result.message) {
          toast.success(result.message);
        }
      } else if (
        result.successCount.add > 0 ||
        result.successCount.remove > 0
      ) {
        // Partial success
        setPendingChanges(new Map());
        refreshCalendars();
        setIsEditModalOpen(false);
        alert(`${result.message}\n\nErrors:\n${result.errors.join("\n")}`);
      } else {
        // All failed - only show alert for actual errors
        if (result.errors.length > 0) {
          alert(`${result.message}\n\nErrors:\n${result.errors.join("\n")}`);
        } else {
          toast.info(result.message || "No changes were made.");
        }
      }
    } catch (error) {
      console.error("Batch submission failed:", error);
      alert(
        `Failed to submit changes: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotToggle = useCallback((clickInfo: EventClickArg) => {
    const eventType = clickInfo.event.extendedProps.type;
    const dateTime = clickInfo.event.start!.toISOString();

    setPendingChanges((prev) => {
      const newChanges = new Map(prev);

      if (newChanges.has(dateTime)) {
        // Remove the pending change (revert to original state)
        newChanges.delete(dateTime);
      } else {
        // Add new pending change
        if (eventType === "absence") {
          newChanges.set(dateTime, {
            dateTime,
            action: "remove",
            originalType: "absence",
          });
        } else if (eventType === "available") {
          newChanges.set(dateTime, {
            dateTime,
            action: "add",
            originalType: "available",
          });
        }
      }

      return newChanges;
    });
  }, []);

  return (
    <div className={styles.container}>
      <Calendar
        height="auto"
        contentHeight="auto"
        key={refreshKey} // Force refresh when key changes
        events={fetchCalendarEvents}
        selectable={false}
        headerRight={
          <ActionButton
            btnText="Edit Absences"
            onClick={() => setIsEditModalOpen(true)}
            className="editBtn"
          />
        }
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        overlayClosable={true}
        maxHeight="90vh"
        padding="40px"
      >
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Edit Instructor Absences</h2>
            <p>
              Click available slots to mark as absent, or click absence slots to
              remove them.
            </p>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.available}`} />
              <span>Available</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.absence}`} />
              <span>Absence</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendBox} ${styles.available} ${styles.withBadge} ${styles.willBeAbsent}`}
              />
              <span>Will be Absent</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendBox} ${styles.absence} ${styles.withBadge} ${styles.willBeAvailable}`}
              />
              <span>Will be Available</span>
            </div>
          </div>

          <div className={styles.calendarContainer}>
            <Calendar
              height="100%"
              contentHeight="auto"
              key={modalRefreshKey}
              events={fetchCalendarEvents}
              eventClick={handleSlotToggle}
              selectable={false}
              eventDidMount={(info) => {
                const { hasPendingChange, changeType, type } =
                  info.event.extendedProps;
                if (hasPendingChange && changeType === "toRemove") {
                  const element = info.el;
                  element.style.position = "relative";

                  // Create badge element
                  const badge = document.createElement("div");
                  badge.className = styles.eventBadge;

                  if (type === "available") {
                    // Available to remove - red badge
                    badge.classList.add(styles.willBeAbsent);
                    badge.title = "Will be marked absent";
                  } else if (type === "absence") {
                    // Absence to remove - green badge
                    badge.classList.add(styles.willBeAvailable);
                    badge.title = "Will be removed";
                  }

                  element.appendChild(badge);
                }
              }}
            />
          </div>

          <div className={styles.modalActions}>
            <ActionButton
              type="button"
              onClick={() => {
                setPendingChanges(new Map());
                setIsEditModalOpen(false);
              }}
              disabled={isSubmitting}
              className="cancelBtn"
              btnText="Cancel"
            />
            <ActionButton
              type="button"
              onClick={handleBatchSubmit}
              disabled={pendingChanges.size === 0 || isSubmitting}
              className="submitBtn"
              btnText={
                isSubmitting
                  ? "Submitting..."
                  : `Submit (${pendingChanges.size})`
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

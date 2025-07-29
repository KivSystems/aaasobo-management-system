import { useState, useEffect } from "react";
import Modal from "@/app/components/elements/modal/Modal";
import EditableScheduleCalendar from "./EditableScheduleCalendar";
import { InstructorSlot } from "@/app/helper/api/instructorsApi";
import {
  utcToJstTime,
  jstTimeToUtc,
  slotToKey,
  keyToSlot,
} from "@/app/helper/utils/scheduleUtils";
import styles from "./AddScheduleModal.module.scss";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    effectiveFrom: string,
    slots: Omit<InstructorSlot, "scheduleId">[],
  ) => void;
  initialSlots?: InstructorSlot[];
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialSlots = [],
}: AddScheduleModalProps) {
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [editedSlots, setEditedSlots] = useState<Set<string>>(new Set());

  const slotsToKeys = (slots: InstructorSlot[]): Set<string> => {
    return new Set(
      slots.map((slot) => {
        const time = utcToJstTime(slot.startTime);
        return slotToKey(slot.weekday, time);
      }),
    );
  };

  const keysToSlots = (
    keys: Set<string>,
  ): Omit<InstructorSlot, "scheduleId">[] => {
    return Array.from(keys).map((key) => {
      const { weekday, startTime } = keyToSlot(key);
      return {
        weekday,
        startTime: jstTimeToUtc(startTime),
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEffectiveFrom(tomorrow.toISOString().split("T")[0]);
      setEditedSlots(slotsToKeys(initialSlots));
    }
  }, [isOpen, initialSlots]);

  // Toggle slot function
  const toggleSlot = (weekday: number, time: string) => {
    const key = slotToKey(weekday, time);
    setEditedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveFrom) {
      const slots = keysToSlots(editedSlots);
      onSubmit(effectiveFrom, slots);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Add New Schedule Version</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.dateSection}>
              <label htmlFor="effectiveFrom">
                <strong>Effective From:</strong>
                <input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className={styles.dateInput}
                />
              </label>
            </div>

            <div className={styles.scheduleSection}>
              <p>
                <strong>Schedule Configuration:</strong>
              </p>
              <p>
                Click time slots to add or remove them from the new schedule
                version.
              </p>

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div
                    className={`${styles.legendDot} ${styles.unchanged}`}
                  ></div>
                  <span>Unchanged (from current)</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.added}`}></div>
                  <span>Added (new)</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={`${styles.legendDot} ${styles.removed}`}
                  ></div>
                  <span>Removed</span>
                </div>
              </div>

              <div className={styles.calendarContainer}>
                <EditableScheduleCalendar
                  initialSlots={initialSlots}
                  editedSlots={editedSlots}
                  onSlotToggle={toggleSlot}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!effectiveFrom}
            >
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

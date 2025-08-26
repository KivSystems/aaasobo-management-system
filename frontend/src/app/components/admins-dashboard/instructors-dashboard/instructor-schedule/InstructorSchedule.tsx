import styles from "./InstructorSchedule.module.scss";

import { useEffect, useState, useCallback } from "react";
import {
  getInstructorSchedules,
  getInstructorScheduleById,
  createInstructorSchedule,
  InstructorSchedule as Schedule,
  InstructorScheduleWithSlots,
  InstructorSlot,
} from "@/app/helper/api/instructorsApi";
import ScheduleCalendar from "./ScheduleCalendar";
import AddScheduleModal from "./AddScheduleModal";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { toast } from "react-toastify";

export default function InstructorSchedule({
  instructorId,
}: {
  instructorId: number;
}) {
  const today = new Date().toISOString().split("T")[0];

  // State for versioned schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const [selectedSchedule, setSelectedSchedule] =
    useState<InstructorScheduleWithSlots | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all schedule versions
  const fetchSchedules = useCallback(async () => {
    try {
      const response = await getInstructorSchedules(instructorId);
      if ("message" in response) {
        alert(response.message);
        return;
      }
      setSchedules(response.schedules);

      // Auto-select the active schedule
      const activeSchedule = response.schedules.find(
        (s) => s.effectiveTo === null,
      );
      if (activeSchedule) {
        setSelectedScheduleId(activeSchedule.id);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  }, [instructorId]);

  // Fetch details for selected schedule
  const fetchScheduleDetails = useCallback(
    async (scheduleId: number) => {
      try {
        const response = await getInstructorScheduleById(
          instructorId,
          scheduleId,
        );
        if ("message" in response) {
          alert(response.message);
          return;
        }
        setSelectedSchedule(response.schedule);
      } catch (error) {
        console.error("Failed to fetch schedule details:", error);
      }
    },
    [instructorId],
  );

  // Fetch schedules when component mounts
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Fetch schedule details when a schedule is selected
  useEffect(() => {
    if (selectedScheduleId) {
      fetchScheduleDetails(selectedScheduleId);
    }
  }, [selectedScheduleId, fetchScheduleDetails]);

  // Handle schedule version selection
  const handleScheduleSelection = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
  };

  // Handle creating new schedule
  const handleCreateSchedule = async (
    effectiveFrom: string,
    slots: Omit<InstructorSlot, "scheduleId">[],
  ) => {
    try {
      const cookie = document.cookie;

      const response = await createInstructorSchedule(
        instructorId,
        effectiveFrom,
        slots,
        cookie,
      );

      if ("message" in response) {
        alert(response.message);
        return;
      }

      // Refresh schedules and select the new one
      await fetchSchedules();
      setSelectedScheduleId(response.schedule.id);
      toast.success("Schedule created successfully!");
    } catch (error) {
      console.error("Failed to create schedule:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to create schedule: ${errorMessage}`);
    }
  };

  return (
    <>
      <div className={styles.dateInput}>
        <div className={styles.scheduleHeader}>
          <label className={styles.label}>
            Schedule Period (Japan Time)
            <select
              className={styles.input}
              value={selectedScheduleId || ""}
              onChange={(e) => handleScheduleSelection(Number(e.target.value))}
            >
              <option value="">Select a schedule period</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {new Date(schedule.effectiveFrom).toLocaleDateString(
                    "ja-JP",
                    { timeZone: "Asia/Tokyo" },
                  )}{" "}
                  -{" "}
                  {schedule.effectiveTo
                    ? new Date(
                        new Date(schedule.effectiveTo).getTime() -
                          24 * 60 * 60 * 1000,
                      ).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
                    : "Current"}
                </option>
              ))}
            </select>
          </label>
          <ActionButton
            type="button"
            onClick={() => setIsModalOpen(true)}
            btnText="Add New Schedule"
            className="addBtn"
          />
        </div>
      </div>

      {selectedSchedule && <ScheduleCalendar slots={selectedSchedule.slots} />}

      {!selectedSchedule && schedules.length === 0 && (
        <div className={styles.noSchedules}>
          <p>No schedule versions found for this instructor.</p>
        </div>
      )}

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSchedule}
        initialSlots={selectedSchedule?.slots || []}
      />
    </>
  );
}

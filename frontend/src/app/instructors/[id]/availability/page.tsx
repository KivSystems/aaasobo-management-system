"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getActiveInstructorSchedule,
  InstructorSlot,
} from "@/app/helper/api/instructorsApi";
import ScheduleCalendar from "@/app/components/admins-dashboard/instructors-dashboard/instructor-schedule/ScheduleCalendar";
import Loading from "@/app/components/elements/loading/Loading";
import styles from "./page.module.scss";

const Page = () => {
  const params = useParams();
  const instructorId = parseInt(params.id as string);
  const [slots, setSlots] = useState<InstructorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const scheduleData = await getActiveInstructorSchedule(
          instructorId,
          today,
        );
        if (scheduleData.schedule?.slots) {
          setSlots(scheduleData.schedule.slots);
        }
      } catch (err) {
        console.error("Failed to fetch instructor schedule:", err);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchSchedule();
    }
  }, [instructorId]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <h1>Instructor Schedule</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Instructor Schedule Calendar</h1>
      <p>This shows the current active schedule for this instructor.</p>
      <ScheduleCalendar slots={slots} />
    </div>
  );
};

export default Page;

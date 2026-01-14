import {
  getInstructor,
  getInstructorScheduleById,
  getInstructorSchedules,
  type InstructorScheduleWithSlots,
} from "@/app/helper/api/instructorsApi";
import type { InstructorSchedule } from "@shared/schemas/instructors";
import InstructorCalendar from "../../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendar";
import InstructorDashboardClient from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardClient";
import { getCookie } from "../../../../proxy";

export default async function InstructorDashboardForAdmin({
  adminId,
  instructorId,
  userSessionType,
}: {
  adminId: number;
  instructorId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch instructor's data
  // [For InstructorProfile]
  const data = await getInstructor(instructorId, cookie);
  let instructor = null;
  if ("message" in data) {
    instructor = data.message;
  } else {
    instructor = data.instructor;
  }
  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
  const extractTokenLetters = (token: string) => {
    const parts = token.split("_");
    return parts[3] ? parts[3].toLowerCase() : "";
  };
  const tokenSpecificLetters = extractTokenLetters(blobReadWriteToken || "");

  let initialSchedules: InstructorSchedule[] = [];
  let initialSelectedScheduleId: number | null = null;
  let initialSelectedSchedule: InstructorScheduleWithSlots | null = null;
  try {
    const schedulesResponse = await getInstructorSchedules(
      instructorId,
      cookie,
    );
    initialSchedules = schedulesResponse.schedules;
    const activeSchedule = initialSchedules.find(
      (schedule) => schedule.effectiveTo === null,
    );
    if (activeSchedule) {
      initialSelectedScheduleId = activeSchedule.id;
      const scheduleDetailResponse = await getInstructorScheduleById(
        instructorId,
        activeSchedule.id,
        cookie,
      );
      initialSelectedSchedule = scheduleDetailResponse.schedule;
    }
  } catch (error) {
    console.error("Failed to load instructor schedules:", error);
  }

  return (
    <InstructorDashboardClient
      adminId={adminId}
      instructorId={instructorId}
      instructor={instructor}
      token={tokenSpecificLetters}
      userSessionType={userSessionType}
      initialSchedules={initialSchedules}
      initialSelectedScheduleId={initialSelectedScheduleId}
      initialSelectedSchedule={initialSelectedSchedule}
      classScheduleComponent={
        <InstructorCalendar
          adminId={adminId}
          instructorId={instructorId}
          userSessionType={userSessionType}
        />
      }
    />
  );
}

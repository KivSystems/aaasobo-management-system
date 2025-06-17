import { getInstructor } from "@/app/helper/api/instructorsApi";
import InstructorCalendar from "../../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendar";
import InstructorDashboardClient from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardClient";

export default async function InstructorDashboardForAdmin({
  userId,
  instructorId,
}: {
  userId: number;
  instructorId: number;
}) {
  // Fetch instructor's data
  // [For InstructorProfile]
  const data = await getInstructor(instructorId);
  let instructor = null;
  if ("message" in data) {
    instructor = data.message;
  } else {
    instructor = data.instructor;
  }

  // TODO: Add fetching functions for the following purposes:
  // InstructorCalendar, AvailabilityCalendar, and InstructorSchedule

  return (
    <InstructorDashboardClient
      userId={userId}
      instructorId={instructorId}
      instructor={instructor}
      classScheduleComponent={
        <InstructorCalendar
          instructorId={instructorId}
          isAdminAuthenticated={true}
        />
      }
    />
  );
}

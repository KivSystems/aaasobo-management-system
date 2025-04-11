import InstructorTabs from "@/app/components/admins-dashboard/instructors-dashboard/InstructorTabs";
import { getInstructor } from "@/app/helper/api/instructorsApi";

export default async function InstructorDashboardForAdmin({
  instructorId,
}: {
  instructorId: number;
}) {
  // Fetch instructor's data
  // [For InstructorProfile]
  const data = await getInstructor(instructorId);
  let instructor = null;
  if ("message" in data) {
    console.warn("Failed to fetch instructor:", data.message);
  } else {
    instructor = data.instructor;
  }

  // TODO: Add fetching functions for the following purposes:
  // InstructorCalendar, AvailabilityCalendar, and InstructorSchedule

  return <InstructorTabs instructorId={instructorId} instructor={instructor} />;
}

import {
  getCalendarAvailabilities,
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import InstructorCalendarClient from "./InstructorCalendarClient";

async function InstructorCalendar({
  instructorId,
  isAdminAuthenticated,
}: {
  instructorId: number;
  isAdminAuthenticated?: boolean;
}) {
  const [classes, availabilities, profile] = await Promise.all([
    getCalendarClasses(instructorId),
    getCalendarAvailabilities(instructorId),
    getInstructorProfile(instructorId),
  ]);

  const instructorCalendarEvents = [...classes, ...availabilities];
  const createdAt: string = profile.createdAt;
  const validRange = getValidRange(createdAt, 3);

  return (
    <InstructorCalendarClient
      instructorId={instructorId}
      isAdminAuthenticated={isAdminAuthenticated}
      instructorCalendarEvents={instructorCalendarEvents}
      validRange={validRange}
    />
  );
}

export default InstructorCalendar;

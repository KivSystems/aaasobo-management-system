import {
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import { getValidRange } from "@/app/helper/utils/calendarUtils";
import InstructorCalendarClient from "./InstructorCalendarClient";
import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";

async function InstructorCalendar({
  adminId,
  instructorId,
  userSessionType,
}: {
  adminId?: number;
  instructorId: number;
  userSessionType?: UserType;
}) {
  const [classes, profile, schedule, events] = await Promise.all([
    getCalendarClasses(instructorId),
    getInstructorProfile(instructorId),
    getAllBusinessSchedules(),
    getAllEvents(),
  ]);

  const instructorCalendarEvents = classes;
  const createdAt: string = profile.createdAt;
  const validRange = getValidRange(createdAt, 3);

  const colorsForEvents: { event: string; color: string }[] = events
    .map((e: EventColor) => ({
      event: e.Event,
      color: e["Color Code"],
    }))
    .filter((e: { event: string; color: string }) => e.color !== "#FFFFFF"); // Filter out events with white color (#FFFFFF)

  return (
    <InstructorCalendarClient
      adminId={adminId}
      instructorId={instructorId}
      userSessionType={userSessionType}
      instructorCalendarEvents={instructorCalendarEvents}
      validRange={validRange}
      businessSchedule={schedule.organizedData}
      colorsForEvents={colorsForEvents}
    />
  );
}

export default InstructorCalendar;

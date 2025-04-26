import InstructorCalendar from "@/app/components/instructors-dashboard/class-schedule/InstructorCalendar";
import {
  getCalendarClasses,
  getInstructorProfile,
} from "@/app/helper/api/instructorsApi";
import { INVALID_INSTRUCTOR_ID } from "@/app/helper/messages/instructorDashboard";

const ClassSchedulePage = async ({ params }: { params: { id: string } }) => {
  const instructorId = parseInt(params.id);

  // TODO: Use promise.all
  const classes: EventType[] | [] = await getCalendarClasses(instructorId);
  const instructorProfile = await getInstructorProfile(instructorId);
  const createdAt: string = instructorProfile.createdAt;

  if (isNaN(instructorId)) {
    console.error(`Invalid instructor ID: ID = ${instructorId}`);
    throw new Error(INVALID_INSTRUCTOR_ID);
  }
  return <InstructorCalendar id={instructorId} />;
};

export default ClassSchedulePage;

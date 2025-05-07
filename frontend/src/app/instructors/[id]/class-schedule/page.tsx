import InstructorCalendar from "@/app/components/instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendar";
import { INVALID_INSTRUCTOR_ID } from "@/app/helper/messages/instructorDashboard";

const ClassSchedulePage = async ({ params }: { params: { id: string } }) => {
  const instructorId = parseInt(params.id);

  if (isNaN(instructorId)) {
    console.error(`Invalid instructor ID: ID = ${instructorId}`);
    throw new Error(INVALID_INSTRUCTOR_ID);
  }
  return <InstructorCalendar instructorId={instructorId} />;
};

export default ClassSchedulePage;

import InstructorCalendar from "@/components/instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendar";
import { INVALID_INSTRUCTOR_ID } from "@/lib/messages/instructorDashboard";

const ClassSchedulePage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const params = await props.params;
  const instructorId = parseInt(params.id);

  if (isNaN(instructorId)) {
    console.error(`Invalid instructor ID: ID = ${instructorId}`);
    throw new Error(INVALID_INSTRUCTOR_ID);
  }
  return <InstructorCalendar instructorId={instructorId} />;
};

export default ClassSchedulePage;

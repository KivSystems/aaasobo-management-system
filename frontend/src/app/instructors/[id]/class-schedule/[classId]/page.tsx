import ClassDetails from "@/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import { getSameDateClasses } from "@/lib/api/instructorsApi";
import { getCookie } from "../../../../../proxy";

const ClassDetailsPage = async (props: {
  params: Promise<{ id: string; classId: string }>;
}) => {
  const params = await props.params;
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  // Get the cookies from the request headers
  const cookie = await getCookie();

  const { selectedClassDetails, sameDateClasses } = await getSameDateClasses(
    instructorId,
    classId,
    cookie,
  );

  return (
    <ClassDetails
      instructorId={instructorId}
      classId={classId}
      classDetails={selectedClassDetails}
      classes={sameDateClasses}
      previousPage="instructor-calendar"
    />
  );
};

export default ClassDetailsPage;

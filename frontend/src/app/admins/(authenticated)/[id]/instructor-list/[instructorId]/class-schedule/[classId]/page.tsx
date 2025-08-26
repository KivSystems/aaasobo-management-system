import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import { getSameDateClasses } from "@/app/helper/api/instructorsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({
  params,
}: {
  params: { id: string; instructorId: string; classId: string };
}) => {
  // Authenticate user session
  const userSessionType = await authenticateUserSession("admin", params.id);
  const adminId = parseInt(params.id);

  // Get the instructorId and classId from the URL parameters
  const instructorId = parseInt(params.instructorId);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  const { selectedClassDetails, sameDateClasses } = await getSameDateClasses(
    instructorId,
    classId,
  );

  return (
    <ClassDetails
      adminId={adminId}
      instructorId={instructorId}
      classId={classId}
      userSessionType={userSessionType}
      classDetails={selectedClassDetails}
      classes={sameDateClasses}
      previousPage="instructor-list"
    />
  );
};

export default Page;

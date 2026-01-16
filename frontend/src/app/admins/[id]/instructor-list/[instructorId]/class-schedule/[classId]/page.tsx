import ClassDetails from "@/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import { getSameDateClasses } from "@/lib/api/instructorsApi";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";
import { getCookie } from "../../../../../../../proxy";

const Page = async (props: {
  params: Promise<{ id: string; instructorId: string; classId: string }>;
}) => {
  const params = await props.params;
  // Authenticate user session
  const userSessionType = await authenticateUserSession("admin", params.id);
  const adminId = parseInt(params.id);

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Get the instructorId and classId from the URL parameters
  const instructorId = parseInt(params.instructorId);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  const { selectedClassDetails, sameDateClasses } = await getSameDateClasses(
    instructorId,
    classId,
    cookie,
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

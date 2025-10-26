import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import {
  getSameDateClasses,
  getInstructorIdByClassId,
} from "@/app/helper/api/instructorsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";
import { getCookie } from "../../../../../../middleware";

const Page = async ({
  params,
}: {
  params: { id: string; classId: string };
}) => {
  // Authenticate user session
  const userSessionType = await authenticateUserSession("admin", params.id);
  const adminId = parseInt(params.id);

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Get the classId from the URL parameters
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    return <p>Class not found (invalid class id)</p>;
  }

  // Get the instructorId from the applicable class information
  const response = await getInstructorIdByClassId(classId, cookie);

  let instructorId: number;
  if (response && "instructorId" in response) {
    instructorId = response.instructorId;
  } else {
    return <p>Class not found (invalid instructor id)</p>;
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
      previousPage="class-list"
    />
  );
};

export default Page;

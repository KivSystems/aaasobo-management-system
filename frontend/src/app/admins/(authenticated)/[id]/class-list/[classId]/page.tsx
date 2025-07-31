import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import {
  getSameDateClasses,
  getInstructorIdByClassId,
} from "@/app/helper/api/instructorsApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({
  params,
}: {
  params: { id: string; classId: string };
}) => {
  // Get the admin id from the URL parameters
  let adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    // Get admin id from session
    const session = await getUserSession("admin");

    // If session is not found or user id is not present, throw an error
    if (!session || !session.user.id) {
      return <p>Class not found (invalid admin id)</p>;
    }
    adminId = parseInt(session.user.id);
  }
  // Set the authentication status based on the adminId
  const isAuthenticated: boolean = !isNaN(adminId);

  // Get the classId from the URL parameters
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    return <p>Class not found (invalid class id)</p>;
  }

  // Get the instructorId from the applicable class information
  const response = await getInstructorIdByClassId(classId);

  let instructorId: number;
  if (response && "instructorId" in response) {
    instructorId = response.instructorId;
  } else {
    return <p>Class not found (invalid instructor id)</p>;
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
      isAdminAuthenticated={isAuthenticated}
      classDetails={selectedClassDetails}
      classes={sameDateClasses}
    />
  );
};

export default Page;

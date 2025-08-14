import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/classDetails/ClassDetails";
import { getSameDateClasses } from "@/app/helper/api/instructorsApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({
  params,
}: {
  params: { id: string; instructorId: string; classId: string };
}) => {
  // Get the admin id from the URL parameters
  let adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    // Get admin id from session
    const session = await getUserSession("admin");

    // If session is not found or user id is not present, throw an error
    if (!session || !session.user.id) {
      throw new Error("Invalid adminId");
    }
    adminId = parseInt(session.user.id);
  }
  // Set the authentication status based on the adminId
  const isAuthenticated: boolean = !isNaN(adminId);

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
      isAdminAuthenticated={isAuthenticated}
      classDetails={selectedClassDetails}
      classes={sameDateClasses}
      previousPage="instructor-list"
    />
  );
};

export default Page;

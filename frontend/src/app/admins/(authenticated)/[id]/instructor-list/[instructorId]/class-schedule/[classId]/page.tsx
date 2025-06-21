import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/ClassDetails";
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

  const instructorId = parseInt(params.instructorId);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <ClassDetails
      adminId={adminId}
      instructorId={instructorId}
      classId={classId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
};

export default Page;

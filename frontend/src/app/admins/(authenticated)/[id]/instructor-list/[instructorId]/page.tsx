import InstructorDashboardForAdmin from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardForAdmin";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function Page({
  params,
}: {
  params: { id: string; instructorId: string };
}) {
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "admin",
    params.id,
  );
  const adminId = parseInt(params.id);
  const instructorId = parseInt(params.instructorId);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <InstructorDashboardForAdmin
      adminId={adminId}
      instructorId={instructorId}
      userSessionType={userSessionType}
    />
  );
}

export default Page;

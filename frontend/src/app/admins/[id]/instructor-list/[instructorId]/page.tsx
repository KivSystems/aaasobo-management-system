import InstructorDashboardForAdmin from "@/components/admins-dashboard/instructors-dashboard/InstructorDashboardForAdmin";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";

async function Page(props: {
  params: Promise<{ id: string; instructorId: string }>;
}) {
  const params = await props.params;
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

import InstructorCalendarForAdmin from "@/components/admins-dashboard/InstructorCalendarForAdmin";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "admin",
    params.id,
  );
  const adminId = parseInt(params.id);

  return (
    <InstructorCalendarForAdmin
      adminId={adminId}
      userSessionType={userSessionType}
    />
  );
};

export default Page;

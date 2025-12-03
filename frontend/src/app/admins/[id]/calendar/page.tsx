import InstructorCalendarForAdmin from "@/app/components/admins-dashboard/InstructorCalendarForAdmin";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({ params }: { params: { id: string } }) => {
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

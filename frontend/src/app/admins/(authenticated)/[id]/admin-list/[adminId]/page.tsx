import AdminDashboardForAdmin from "@/app/components/admins-dashboard/AdminDashboardForAdmin";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function Page({ params }: { params: { id: string; adminId: string } }) {
  // Authenticate user session
  const userSessionType = await authenticateUserSession("admin", params.id);

  const userId = parseInt(params.id);
  const adminId = parseInt(params.adminId);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  return (
    <AdminDashboardForAdmin
      userId={userId}
      adminId={adminId}
      userSessionType={userSessionType}
    />
  );
}

export default Page;

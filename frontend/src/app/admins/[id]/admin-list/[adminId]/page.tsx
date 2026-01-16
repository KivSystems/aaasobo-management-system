import AdminDashboardForAdmin from "@/components/admins-dashboard/AdminDashboardForAdmin";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";

async function Page(props: {
  params: Promise<{ id: string; adminId: string }>;
}) {
  const params = await props.params;
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

import AdminTabs from "@/app/components/admins-dashboard/AdminDashboardClient";
import { getAdminById } from "@/app/helper/api/adminsApi";

export default async function AdminDashboardForAdmin({
  userId,
  adminId,
  userSessionType,
}: {
  userId: number;
  adminId: number;
  userSessionType: UserType;
}) {
  // Fetch admin's data
  const data = await getAdminById(adminId);
  let admin = null;
  if ("message" in data) {
    admin = data.message;
  } else {
    admin = data.admin;
  }

  return (
    <AdminTabs
      userId={userId}
      adminId={adminId}
      admin={admin}
      userSessionType={userSessionType}
    />
  );
}

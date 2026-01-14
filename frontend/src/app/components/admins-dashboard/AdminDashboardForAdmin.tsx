import AdminTabs from "@/app/components/admins-dashboard/AdminDashboardClient";
import { getAdminById } from "@/app/helper/api/adminsApi";
import { getCookie } from "../../../proxy";

export default async function AdminDashboardForAdmin({
  userId,
  adminId,
  userSessionType,
}: {
  userId: number;
  adminId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch admin's data
  const data = await getAdminById(adminId, cookie);
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

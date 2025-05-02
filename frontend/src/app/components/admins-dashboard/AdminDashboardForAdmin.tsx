import AdminTabs from "@/app/components/admins-dashboard/AdminDashboardClient";
import { getAdmin } from "@/app/helper/api/adminsApi";

export default async function AdminDashboardForAdmin({
  adminId,
}: {
  adminId: number;
}) {
  // Fetch admin's data
  const data = await getAdmin(adminId);
  let admin = null;
  if ("message" in data) {
    admin = data.message;
  } else {
    admin = data.admin;
  }

  return <AdminTabs adminId={adminId} admin={admin} />;
}

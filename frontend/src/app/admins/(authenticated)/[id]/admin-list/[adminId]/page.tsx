import AdminDashboardForAdmin from "@/app/components/admins-dashboard/AdminDashboardForAdmin";

function Page({ params }: { params: { id: string; adminId: string } }) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    throw new Error("Invalid userId");
  }
  const adminId = parseInt(params.adminId);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  return <AdminDashboardForAdmin userId={userId} adminId={adminId} />;
}

export default Page;

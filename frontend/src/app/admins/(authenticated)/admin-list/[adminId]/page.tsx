import AdminDashboardForAdmin from "@/app/components/admins-dashboard/AdminDashboardForAdmin";

function Page({ params }: { params: { adminId: string } }) {
  const adminId = parseInt(params.adminId);

  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  return <AdminDashboardForAdmin adminId={adminId} />;
}

export default Page;

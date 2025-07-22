import CustomerDashboardForAdmin from "@/app/components/admins-dashboard/customers-dashboard/classCalendarForAdmin/CustomerDashboardForAdmin";

function Page({ params }: { params: { id: string; customerId: string } }) {
  const adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    throw new Error("Invalid userId");
  }

  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <CustomerDashboardForAdmin adminId={adminId} customerId={customerId} />
  );
}

export default Page;

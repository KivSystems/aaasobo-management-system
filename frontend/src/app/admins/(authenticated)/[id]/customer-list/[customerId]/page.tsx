import CustomerDashboardForAdmin from "@/app/components/admins-dashboard/customers-dashboard/classCalendarForAdmin/CustomerDashboardForAdmin";

function Page({ params }: { params: { id: string; customerId: string } }) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    throw new Error("Invalid userId");
  }

  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return <CustomerDashboardForAdmin userId={userId} customerId={customerId} />;
}

export default Page;

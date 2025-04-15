import CustomerDashboardForAdmin from "@/app/components/admins-dashboard/customers-dashboard/classCalendarForAdmin/CustomerDashboardForAdmin";

function Page({ params }: { params: { customerId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return <CustomerDashboardForAdmin customerId={customerId} />;
}

export default Page;

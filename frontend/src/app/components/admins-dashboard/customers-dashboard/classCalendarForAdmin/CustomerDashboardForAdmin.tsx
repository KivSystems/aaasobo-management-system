import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import CustomerDashboardClient from "./CustomerDashboardClient";
import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";
import { getCustomerById } from "@/app/helper/api/customersApi";

export default async function CustomerDashboardForAdmin({
  userId,
  customerId,
}: {
  userId: number;
  customerId: number;
}) {
  const customerProfile = await getCustomerById(customerId);

  return (
    <CustomerDashboardClient
      userId={userId}
      customerId={customerId}
      classCalendarComponent={
        <ClassCalendar customerId={customerId} isAdminAuthenticated={true} />
      }
      customerProfile={customerProfile}
    />
  );
}

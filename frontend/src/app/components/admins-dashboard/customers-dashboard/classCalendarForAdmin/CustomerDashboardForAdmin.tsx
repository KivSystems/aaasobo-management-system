import CustomerDashboardClient from "./CustomerDashboardClient";
import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";
import { getCustomerById } from "@/app/helper/api/customersApi";

export default async function CustomerDashboardForAdmin({
  adminId,
  customerId,
}: {
  adminId: number;
  customerId: number;
}) {
  const customerProfile = await getCustomerById(customerId);

  return (
    <CustomerDashboardClient
      adminId={adminId}
      customerId={customerId}
      classCalendarComponent={
        <ClassCalendar
          adminId={userId}
          customerId={customerId}
          isAdminAuthenticated={true}
        />
      }
      customerProfile={customerProfile}
    />
  );
}

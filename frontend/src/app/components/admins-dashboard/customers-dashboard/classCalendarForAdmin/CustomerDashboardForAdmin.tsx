import CustomerDashboardClient from "./CustomerDashboardClient";
import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";

export default function CustomerDashboardForAdmin({
  customerId,
}: {
  customerId: number;
}) {
  return (
    <CustomerDashboardClient
      customerId={customerId}
      classCalendarComponent={
        <ClassCalendar customerId={customerId} isAdminAuthenticated={true} />
      }
    />
  );
}

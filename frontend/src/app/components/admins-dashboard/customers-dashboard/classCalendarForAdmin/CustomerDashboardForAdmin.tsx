import CustomerDashboardClient from "./CustomerDashboardClient";
import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";

export default function CustomerDashboardForAdmin({
  userId,
  customerId,
}: {
  userId: number;
  customerId: number;
}) {
  return (
    <CustomerDashboardClient
      userId={userId}
      customerId={customerId}
      classCalendarComponent={
        <ClassCalendar customerId={customerId} isAdminAuthenticated={true} />
      }
    />
  );
}

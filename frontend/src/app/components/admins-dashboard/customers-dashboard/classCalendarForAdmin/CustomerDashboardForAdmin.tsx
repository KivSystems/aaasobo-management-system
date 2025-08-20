import CustomerDashboardClient from "./CustomerDashboardClient";
import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";
import {
  getChildProfiles,
  getCustomerById,
} from "@/app/helper/api/customersApi";

export default async function CustomerDashboardForAdmin({
  adminId,
  customerId,
  userSessionType,
}: {
  adminId: number;
  customerId: number;
  userSessionType: UserType;
}) {
  const customerProfile = await getCustomerById(customerId);
  const childProfiles = await getChildProfiles(customerId);

  return (
    <CustomerDashboardClient
      adminId={adminId}
      customerId={customerId}
      userSessionType={userSessionType}
      classCalendarComponent={
        <ClassCalendar
          customerId={customerId}
          userSessionType={userSessionType}
        />
      }
      customerProfile={customerProfile}
      childProfiles={childProfiles}
    />
  );
}

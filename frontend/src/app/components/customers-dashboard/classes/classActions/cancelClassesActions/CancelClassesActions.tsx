import CancelClassesModalController from "./cancelClassesModalController/CancelClassesModalController";
import { getUpcomingClasses } from "@/app/helper/api/customersApi";

export default async function CancelClassesActions({
  customerId,
  userSessionType,
}: {
  customerId: number;
  userSessionType: UserType;
}) {
  const upcomingClasses: UpcomingClass[] | [] =
    await getUpcomingClasses(customerId);

  return (
    <CancelClassesModalController
      customerId={customerId}
      upcomingClasses={upcomingClasses}
      userSessionType={userSessionType}
    />
  );
}

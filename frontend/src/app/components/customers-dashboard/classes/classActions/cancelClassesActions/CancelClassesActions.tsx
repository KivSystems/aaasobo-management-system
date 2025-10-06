import CancelClassesModalController from "./cancelClassesModalController/CancelClassesModalController";
import { getUpcomingClasses } from "@/app/helper/api/customersApi";

export default async function CancelClassesActions({
  customerId,
  userSessionType,
  terminationAt,
}: {
  customerId: number;
  userSessionType: UserType;
  terminationAt: string | null;
}) {
  const upcomingClasses: UpcomingClass[] | [] =
    await getUpcomingClasses(customerId);

  return (
    <CancelClassesModalController
      customerId={customerId}
      upcomingClasses={upcomingClasses}
      userSessionType={userSessionType}
      terminationAt={terminationAt}
    />
  );
}

import CancelClassesModalController from "./cancelClassesModalController/CancelClassesModalController";
import { getUpcomingClasses } from "@/app/helper/api/customersApi";
import { getCookie } from "../../../../../../proxy";

export default async function CancelClassesActions({
  customerId,
  userSessionType,
  terminationAt,
}: {
  customerId: number;
  userSessionType: UserType;
  terminationAt: string | null;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  const upcomingClasses: UpcomingClass[] | [] = await getUpcomingClasses(
    customerId,
    cookie,
  );

  return (
    <CancelClassesModalController
      customerId={customerId}
      upcomingClasses={upcomingClasses}
      userSessionType={userSessionType}
      terminationAt={terminationAt}
    />
  );
}

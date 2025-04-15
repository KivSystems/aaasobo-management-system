import CancelClassesModalController from "./cancelClassesModalController/CancelClassesModalController";
import { getUpcomingClasses } from "@/app/helper/api/customersApi";

export default async function CancelClassesActions({
  customerId,
  isAdminAuthenticated,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
}) {
  const upcomingClasses: UpcomingClass[] | [] =
    await getUpcomingClasses(customerId);

  return (
    <CancelClassesModalController
      customerId={customerId}
      upcomingClasses={upcomingClasses}
      isAdminAuthenticated={isAdminAuthenticated}
    />
  );
}

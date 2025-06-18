import { getRebookableClasses } from "@/app/helper/api/customersApi";
import { getChildrenByCustomerId } from "@/app/helper/api/childrenApi";
import RebookingModalController from "./rebookingModalController/RebookingModalController";
import RebookingModal from "./rebookingModal/RebookingModal";

export default async function RebookingActions({
  adminId,
  isAdminAuthenticated,
  customerId,
}: {
  adminId?: number;
  isAdminAuthenticated?: boolean;
  customerId: number;
}) {
  const rebookableClasses = await getRebookableClasses(customerId);
  // TODO: use getChildProfiles
  const childrenData = await getChildrenByCustomerId(customerId);
  const hasChildProfile = childrenData.length > 0;

  return (
    <RebookingModalController
      rebookableClasses={rebookableClasses}
      hasChildProfile={hasChildProfile}
      modalContent={
        <RebookingModal
          customerId={customerId}
          adminId={adminId}
          isAdminAuthenticated={isAdminAuthenticated}
          rebookableClasses={rebookableClasses}
        />
      }
    />
  );
}

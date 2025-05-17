import { getRebookableClasses } from "@/app/helper/api/customersApi";
import { getChildrenByCustomerId } from "@/app/helper/api/childrenApi";
import RebookingModalController from "./rebookingModalController/RebookingModalController";
import RebookingModal from "./rebookingModal/RebookingModal";

export default async function RebookingActions({
  isAdminAuthenticated,
  customerId,
}: {
  isAdminAuthenticated?: boolean;
  customerId: number;
}) {
  const rebookableClasses = await getRebookableClasses(customerId);
  const childrenData = await getChildrenByCustomerId(customerId);
  const hasChildProfile = childrenData.length > 0;

  return (
    <RebookingModalController
      rebookableClasses={rebookableClasses}
      hasChildProfile={hasChildProfile}
      modalContent={
        <RebookingModal
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          rebookableClasses={rebookableClasses}
        />
      }
    />
  );
}

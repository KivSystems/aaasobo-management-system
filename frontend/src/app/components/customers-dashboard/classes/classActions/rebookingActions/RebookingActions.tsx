import styles from "./RebookingActions.module.scss";
import { getRebookableClasses } from "@/app/helper/api/customersApi";
import { getChildrenByCustomerId } from "@/app/helper/api/childrenApi";
import RebookingModalController from "./rebookingModalController/RebookingModalController";

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
    <>
      <div className={styles.calendarActions__booking}>
        <RebookingModalController
          customerId={customerId}
          isAdminAuthenticated={isAdminAuthenticated}
          rebookableClasses={rebookableClasses}
          hasChildProfile={hasChildProfile}
        />
      </div>
    </>
  );
}

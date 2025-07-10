import {
  getChildProfiles,
  getRebookableClasses,
} from "@/app/helper/api/customersApi";
import RebookingModalController from "./rebookingModalController/RebookingModalController";
import RebookingForm from "./rebookingForm/RebookingForm";
import { getInstructorProfiles } from "@/app/helper/api/instructorsApi";

export default async function RebookingActions({
  isAdminAuthenticated,
  customerId,
}: {
  isAdminAuthenticated?: boolean;
  customerId: number;
}) {
  const [rebookableClasses, instructorProfiles, childProfiles] =
    await Promise.all([
      getRebookableClasses(customerId),
      getInstructorProfiles(),
      getChildProfiles(customerId),
    ]);

  const hasChildProfile = childProfiles.length > 0;

  return (
    <RebookingModalController
      rebookableClasses={rebookableClasses}
      hasChildProfile={hasChildProfile}
      modalContent={
        <RebookingForm
          customerId={customerId}
          rebookableClasses={rebookableClasses}
          instructorProfiles={instructorProfiles}
          childProfiles={childProfiles}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      }
    />
  );
}

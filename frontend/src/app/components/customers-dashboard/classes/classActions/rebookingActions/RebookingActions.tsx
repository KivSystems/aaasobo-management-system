import {
  getChildProfiles,
  getRebookableClasses,
} from "@/app/helper/api/customersApi";
import RebookingModalController from "./rebookingModalController/RebookingModalController";
import RebookingForm from "./rebookingForm/RebookingForm";
import { getInstructorProfiles } from "@/app/helper/api/instructorsApi";
import { getCookie } from "../../../../../../middleware";

export default async function RebookingActions({
  userSessionType,
  customerId,
  terminationAt,
}: {
  userSessionType?: UserType;
  customerId: number;
  terminationAt: string | null;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  const [rebookableClasses, instructorProfiles, childProfiles] =
    await Promise.all([
      getRebookableClasses(customerId, cookie),
      getInstructorProfiles(cookie),
      getChildProfiles(customerId, cookie),
    ]);

  const hasChildProfile = childProfiles.length > 0;

  return (
    <RebookingModalController
      rebookableClasses={rebookableClasses}
      hasChildProfile={hasChildProfile}
      userSessionType={userSessionType}
      terminationAt={terminationAt}
      modalContent={
        <RebookingForm
          customerId={customerId}
          rebookableClasses={rebookableClasses}
          instructorProfiles={instructorProfiles}
          childProfiles={childProfiles}
          userSessionType={userSessionType}
        />
      }
    />
  );
}

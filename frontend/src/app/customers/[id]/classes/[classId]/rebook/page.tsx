import RebookingForm from "@/app/components/customers-dashboard/classes/rebookingPage/rebookingForm/RebookingForm";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getInstructorAvailabilities } from "@/app/helper/api/classesApi";
import { getChildProfiles } from "@/app/helper/api/customersApi";
import { getInstructorProfiles } from "@/app/helper/api/instructorsApi";
import {
  INVALID_CLASS_ID,
  INVALID_CUSTOMER_ID,
} from "@/app/helper/messages/customerDashboard";

async function RebookingPage({
  params,
}: {
  params: { id: string; classId: string };
}) {
  const customerId = parseInt(params.id);
  const classId = parseInt(params.classId);

  if (isNaN(customerId)) {
    console.error(`Invalid customer ID: ID = ${customerId}`);
    throw new Error(INVALID_CUSTOMER_ID);
  }

  if (isNaN(classId)) {
    console.error(`Invalid class ID: ID = ${classId}`);
    throw new Error(INVALID_CLASS_ID);
  }

  // TODO: use promise all
  const instructorAvailabilities = await getInstructorAvailabilities(classId);
  const instructorProfiles = await getInstructorProfiles();
  const childProfiles = await getChildProfiles(customerId);

  const breadcrumbLinks = [
    {
      href: `/customers/${customerId}/classes`,
      label: { ja: "クラスカレンダー", en: "Class Calendar" },
    },
    { label: { ja: "振替予約ページ", en: "Rebooking Page" } },
  ];

  return (
    <main>
      <Breadcrumb links={breadcrumbLinks} className="rebookingPage" />
      <RebookingForm
        customerId={customerId}
        classId={classId}
        instructorAvailabilities={instructorAvailabilities}
        instructorProfiles={instructorProfiles}
        childProfiles={childProfiles}
      />
    </main>
  );
}

export default RebookingPage;

import RebookingForm from "@/app/components/customers-dashboard/classes/rebookingPage/rebookingForm/RebookingForm";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getInstructorAvailabilities } from "@/app/helper/api/classesApi";
import { getChildProfiles } from "@/app/helper/api/customersApi";
import { getInstructorProfiles } from "@/app/helper/api/instructorsApi";

async function RebookingPage({
  params,
}: {
  params: { id: string; customerId: string; classId: string };
}) {
  const adminId = parseInt(params.id);
  const customerId = parseInt(params.customerId);
  const classId = parseInt(params.classId);

  if (isNaN(adminId)) {
    throw new Error(`Invalid admin ID: ID = ${adminId}`);
  }

  if (isNaN(customerId)) {
    throw new Error(`Invalid customer ID: ID = ${customerId}`);
  }

  if (isNaN(classId)) {
    throw new Error(`Invalid class ID: ID = ${classId}`);
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  const breadcrumbLinks = [
    {
      href: `/admins/${adminId}/customer-list/${customerId}`,
      label: "Class Calendar",
    },
    { label: "Rebooking Page" },
  ];

  const [instructorAvailabilities, instructorProfiles, childProfiles] =
    await Promise.all([
      getInstructorAvailabilities(classId),
      getInstructorProfiles(),
      getChildProfiles(customerId),
    ]);

  return (
    <main>
      <Breadcrumb links={breadcrumbLinks} className="rebookingPage" />
      <RebookingForm
        customerId={customerId}
        classId={classId}
        instructorAvailabilities={instructorAvailabilities}
        instructorProfiles={instructorProfiles}
        childProfiles={childProfiles}
        adminId={adminId}
        isAdminAuthenticated={isAuthenticated}
      />
    </main>
  );
}

export default RebookingPage;

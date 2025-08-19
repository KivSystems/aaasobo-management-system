import InstructorsList from "@/app/components/customers-dashboard/insrtuctor-profiles/InstructorsList";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getAllInstructorProfiles } from "@/app/helper/api/instructorsApi";
import { INVALID_CUSTOMER_ID } from "@/app/helper/messages/customerDashboard";

async function InstructorProfilesPage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);

  if (isNaN(customerId)) {
    console.error(`Invalid customer ID: ID = ${customerId}`);
    throw new Error(INVALID_CUSTOMER_ID);
  }

  // Fetch instructor profiles
  const instructorProfiles = await getAllInstructorProfiles();

  return (
    <>
      <Breadcrumb
        links={[
          {
            label: {
              ja: "インストラクタープロフィール",
              en: "Instructor Profiles",
            },
          },
        ]}
        className="profile"
      />
      <InstructorsList instructorProfiles={instructorProfiles} />
    </>
  );
}

export default InstructorProfilesPage;

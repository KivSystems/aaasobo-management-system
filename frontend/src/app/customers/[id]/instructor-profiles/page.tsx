import InstructorsList from "@/app/components/customers-dashboard/instructor-profiles/InstructorsList";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getAllInstructorProfiles } from "@/app/helper/api/instructorsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function InstructorProfilesPage({ params }: { params: { id: string } }) {
  const customerId = params.id;
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "customer",
    customerId,
  );
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
      <InstructorsList
        instructorProfiles={instructorProfiles}
        userSessionType={userSessionType}
      />
    </>
  );
}

export default InstructorProfilesPage;

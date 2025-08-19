import InstructorsList from "@/app/components/customers-dashboard/instructor-profiles/InstructorsList";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getAllInstructorProfiles } from "@/app/helper/api/instructorsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";
import { getCookie } from "../../../../middleware";

async function InstructorProfilesPage({ params }: { params: { id: string } }) {
  const customerId = params.id;
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "customer",
    customerId,
  );

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch instructor profiles
  const instructorProfiles = await getAllInstructorProfiles(cookie);

  // Show not found message when no instructor profiles are found
  if (instructorProfiles === null) {
    return <p>No instructor profiles found.</p>;
  }

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

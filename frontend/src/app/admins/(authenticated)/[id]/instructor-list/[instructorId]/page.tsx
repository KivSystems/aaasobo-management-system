import InstructorDashboardForAdmin from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardForAdmin";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

async function Page({ params }: { params: { instructorId: string } }) {
  // Get admin id from session
  const session = await getUserSession("admin");

  // If session is not found or user id is not present, throw an error
  if (!session || !session.user.id) {
    throw new Error("Invalid adminId");
  }
  const adminId = parseInt(session.user.id);
  console.log("Page.tsx adminId from session", adminId);

  const instructorId = parseInt(params.instructorId);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <InstructorDashboardForAdmin
      adminId={adminId}
      instructorId={instructorId}
    />
  );
}

export default Page;

import BusinessCalendarForAdmin from "@/app/components/admins-dashboard/BusinessCalendarForAdmin";
import { getAllBusinessSchedules } from "@/app/helper/api/adminsApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({ params }: { params: { id: string } }) => {
  const adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  // Fetch all schedule data
  const schedule = await getAllBusinessSchedules();

  // Set the authentication status based on the session
  const session = await getUserSession("admin");
  const isAuthenticated = !!(session && Number(session.user.id) === adminId);

  return (
    <>
      <BusinessCalendarForAdmin
        businessSchedule={schedule.organizedData}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default Page;

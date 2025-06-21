import BusinessCalendarForAdmin from "@/app/components/admins-dashboard/BusinessCalendarForAdmin";
import { getAllBusinessSchedules } from "@/app/helper/api/adminsApi";

const Page = async () => {
  // Fetch all schedule data
  const schedule = await getAllBusinessSchedules();

  // Set the authentication status as true.
  const isAuthenticated = true;

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

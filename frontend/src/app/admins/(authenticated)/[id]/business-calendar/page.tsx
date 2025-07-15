// import { cookies } from "next/headers";
import BusinessCalendarForAdmin from "@/app/components/admins-dashboard/BusinessCalendarForAdmin";
import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

const Page = async ({ params }: { params: { id: string } }) => {
  const adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  // Fetch all schedule data
  const schedule = await getAllBusinessSchedules();
  // Fetch all events data
  const data = await getAllEvents();
  // Organize the event data by id and event name
  const events: BusinessEventType[] = [
    ...data.map((item: { ID: number; Event: string }) => ({
      id: item.ID,
      name: item.Event,
    })),
    { id: 0, name: "No Event" },
  ].sort((a, b) => a.id - b.id);

  // Set the authentication status based on the session
  const session = await getUserSession("admin");
  const isAuthenticated = !!(session && Number(session.user.id) === adminId);

  return (
    <>
      <BusinessCalendarForAdmin
        businessSchedule={schedule.organizedData}
        events={events}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default Page;

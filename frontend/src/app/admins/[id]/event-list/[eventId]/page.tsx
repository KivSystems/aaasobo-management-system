import EventDashboardForAdmin from "@/app/components/admins-dashboard/events-dashboard/EventDashboardForAdmin";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

async function Page(props: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const params = await props.params;
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "admin",
    params.id,
  );
  const userId = parseInt(params.id);
  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    throw new Error("Invalid eventId");
  }

  return (
    <EventDashboardForAdmin
      userId={userId}
      eventId={eventId}
      userSessionType={userSessionType}
    />
  );
}

export default Page;

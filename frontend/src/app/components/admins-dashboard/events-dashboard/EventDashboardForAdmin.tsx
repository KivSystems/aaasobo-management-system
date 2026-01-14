import EventTabs from "@/app/components/admins-dashboard/events-dashboard/EventDashboardClient";
import { getEventById } from "@/app/helper/api/eventsApi";
import { getCookie } from "../../../../proxy";

export default async function EventDashboardForAdmin({
  userId,
  eventId,
  userSessionType,
}: {
  userId: number;
  eventId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch event data
  const data = await getEventById(eventId, cookie);
  let event = null;
  if ("message" in data) {
    event = data.message;
  } else {
    event = data.event;
  }

  return (
    <EventTabs
      userId={userId}
      eventId={eventId}
      event={event}
      userSessionType={userSessionType}
    />
  );
}

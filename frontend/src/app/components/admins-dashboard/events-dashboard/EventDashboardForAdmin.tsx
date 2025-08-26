import EventTabs from "@/app/components/admins-dashboard/events-dashboard/EventDashboardClient";
import { getEventById } from "@/app/helper/api/eventsApi";

export default async function EventDashboardForAdmin({
  userId,
  eventId,
  userSessionType,
}: {
  userId: number;
  eventId: number;
  userSessionType: UserType;
}) {
  // Fetch event data
  const data = await getEventById(eventId);
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

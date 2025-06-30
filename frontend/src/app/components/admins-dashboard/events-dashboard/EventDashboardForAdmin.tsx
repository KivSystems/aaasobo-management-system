import EventTabs from "@/app/components/admins-dashboard/events-dashboard/EventDashboardClient";
import { getEventById } from "@/app/helper/api/eventsApi";

export default async function EventDashboardForAdmin({
  userId,
  eventId,
}: {
  userId: number;
  eventId: number;
}) {
  // Fetch event data
  const data = await getEventById(eventId);
  let event = null;
  if ("message" in data) {
    event = data.message;
  } else {
    event = data.event;
  }

  return <EventTabs userId={userId} eventId={eventId} event={event} />;
}

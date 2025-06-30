import EventDashboardForAdmin from "@/app/components/admins-dashboard/events-dashboard/EventDashboardForAdmin";

function Page({ params }: { params: { id: string; eventId: string } }) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    throw new Error("Invalid userId");
  }

  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    throw new Error("Invalid eventId");
  }

  return <EventDashboardForAdmin userId={userId} eventId={eventId} />;
}

export default Page;

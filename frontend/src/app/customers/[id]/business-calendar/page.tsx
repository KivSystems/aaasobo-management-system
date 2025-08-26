import {
  getAllBusinessSchedules,
  getAllEvents,
} from "@/app/helper/api/adminsApi";
import { businessCalendarValidRange } from "@/app/helper/utils/calendarUtils";
import BusinessCalendarClient from "@/app/components/admins-dashboard/BusinessCalendarClient";

const Page = async ({ params }: { params: { id: string } }) => {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Fetch all schedule data
  const schedule = await getAllBusinessSchedules();
  // Fetch all events data
  const data = await getAllEvents();
  // Organize the event data by id and event name
  const events: BusinessEventType[] = [
    ...data.map((item: EventColor) => ({
      id: item.ID,
      name: item.Event,
      color: item["Color Code"],
    })),
  ].sort((a, b) => a.id - b.id);

  // Calculate the valid range (from 1 year ago to 1 year later) for the calendar
  const calendarValidRange = businessCalendarValidRange();

  return (
    <>
      <BusinessCalendarClient
        businessSchedule={schedule.organizedData}
        events={events}
        validRange={calendarValidRange}
      />
    </>
  );
};

export default Page;

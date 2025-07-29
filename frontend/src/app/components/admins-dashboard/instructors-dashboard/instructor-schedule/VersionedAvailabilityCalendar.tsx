import { getInstructorAvailableSlots } from "@/app/helper/api/instructorsApi";
import Calendar from "@/app/components/features/calendar/Calendar";
import { EventSourceFuncArg } from "@fullcalendar/core";

export default function VersionedAvailabilityCalendar({
  instructorId,
}: {
  instructorId: number;
}) {
  const formatJSTDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <Calendar
        height="auto"
        contentHeight="auto"
        events={async (info: EventSourceFuncArg) => {
          const startStr = formatJSTDate(info.start);
          const endDate = new Date(info.end);
          endDate.setDate(endDate.getDate() + 1);
          const endStr = formatJSTDate(endDate);

          try {
            const response = await getInstructorAvailableSlots(
              instructorId,
              startStr,
              endStr,
            );

            if ("message" in response) {
              console.error(response.message);
              return [];
            }

            return response.availableSlots.map((slot) => {
              const start = slot.dateTime;
              const end = new Date(
                new Date(start).getTime() + 25 * 60000,
              ).toISOString();

              return {
                id: start,
                start,
                end,
                title: "Available",
                color: "#A2B098",
                textColor: "#FFF",
              };
            });
          } catch (error) {
            console.error("Failed to fetch available slots:", error);
            return [];
          }
        }}
        selectable={false}
      />
    </div>
  );
}

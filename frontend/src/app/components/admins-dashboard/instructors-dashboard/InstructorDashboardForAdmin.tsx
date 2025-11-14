import { getInstructor } from "@/app/helper/api/instructorsApi";
import InstructorCalendar from "../../instructors-dashboard/class-schedule/instructorCalendar/InstructorCalendar";
import InstructorDashboardClient from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardClient";
import { getCookie } from "../../../../middleware";

export default async function InstructorDashboardForAdmin({
  adminId,
  instructorId,
  userSessionType,
}: {
  adminId: number;
  instructorId: number;
  userSessionType: UserType;
}) {
  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Fetch instructor's data
  // [For InstructorProfile]
  const data = await getInstructor(instructorId, cookie);
  let instructor = null;
  if ("message" in data) {
    instructor = data.message;
  } else {
    instructor = data.instructor;
  }
  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
  const extractTokenLetters = (token: string) => {
    const parts = token.split("_");
    return parts[3] ? parts[3].toLowerCase() : "";
  };
  const tokenSpecificLetters = extractTokenLetters(blobReadWriteToken || "");

  // TODO: Add fetching functions for the following purposes:
  // InstructorCalendar, AvailabilityCalendar, and InstructorSchedule

  return (
    <InstructorDashboardClient
      adminId={adminId}
      instructorId={instructorId}
      instructor={instructor}
      token={tokenSpecificLetters}
      userSessionType={userSessionType}
      classScheduleComponent={
        <InstructorCalendar
          adminId={adminId}
          instructorId={instructorId}
          userSessionType={userSessionType}
        />
      }
    />
  );
}

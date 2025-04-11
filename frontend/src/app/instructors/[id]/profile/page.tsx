import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";
import { getInstructor } from "@/app/helper/api/instructorsApi";

async function Page({ params }: { params: { id: string } }) {
  const instructorId = parseInt(params.id);

  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  // Fetch instructor's data
  const data = await getInstructor(instructorId);
  let instructor = null;
  if ("message" in data) {
    console.warn("Failed to fetch instructor:", data.message);
  } else {
    instructor = data.instructor;
  }

  return <InstructorProfile instructor={instructor} />;
}

export default Page;

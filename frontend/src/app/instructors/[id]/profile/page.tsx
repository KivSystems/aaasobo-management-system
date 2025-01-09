"use client";

import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";

const Page = ({ params }: { params: { id: string } }) => {
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return <InstructorProfile instructorId={instructorId} />;
};

export default Page;

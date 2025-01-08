"use client";

import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/ClassDetails";

const Page = ({ params }: { params: { id: string; classId: string } }) => {
  const instructorId = parseInt(params.id);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  return <ClassDetails instructorId={instructorId} classId={classId} />;
};

export default Page;

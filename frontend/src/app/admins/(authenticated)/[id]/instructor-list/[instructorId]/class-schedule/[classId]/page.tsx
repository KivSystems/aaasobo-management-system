"use client";

import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/ClassDetails";

const Page = ({
  params,
}: {
  params: { instructorId: string; classId: string };
}) => {
  const instructorId = parseInt(params.instructorId);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  // Check the authentication of the admin.
  const isAuthenticated = true;

  return (
    <ClassDetails
      instructorId={instructorId}
      classId={classId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
};

export default Page;

import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/ClassDetails";

const Page = ({
  params,
}: {
  params: { id: string; instructorId: string; classId: string };
}) => {
  const adminId = parseInt(params.id);
  const instructorId = parseInt(params.instructorId);
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <ClassDetails
      adminId={adminId}
      instructorId={instructorId}
      classId={classId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
};

export default Page;

import InstructorDashboardForAdmin from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardForAdmin";

function Page({ params }: { params: { id: string; instructorId: string } }) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) {
    throw new Error("Invalid userId");
  }

  const instructorId = parseInt(params.instructorId);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <InstructorDashboardForAdmin userId={userId} instructorId={instructorId} />
  );
}

export default Page;

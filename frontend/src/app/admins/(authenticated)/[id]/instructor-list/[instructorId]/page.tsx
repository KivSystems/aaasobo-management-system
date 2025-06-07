import InstructorDashboardForAdmin from "@/app/components/admins-dashboard/instructors-dashboard/InstructorDashboardForAdmin";

function Page({ params }: { params: { instructorId: string } }) {
  const instructorId = parseInt(params.instructorId);

  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return <InstructorDashboardForAdmin instructorId={instructorId} />;
}

export default Page;

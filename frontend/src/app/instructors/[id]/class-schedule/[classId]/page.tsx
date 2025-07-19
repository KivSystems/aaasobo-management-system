import ClassDetails from "@/app/components/instructors-dashboard/class-schedule/ClassDetails";
import { getSameDateClasses } from "@/app/helper/api/instructorsApi";

const Page = async ({
  params,
}: {
  params: { id: string; classId: string };
}) => {
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  const sameDateClasses = await getSameDateClasses(instructorId, classId);

  return <ClassDetails instructorId={instructorId} classId={classId} />;
};

export default Page;

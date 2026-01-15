import SideNav from "@/app/components/layouts/sideNav/SideNav";
import InstructorLayout from "./InstructorLayout";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <InstructorLayout
      sideNav={<SideNav userId={instructorId} userType="instructor" />}
    >
      {props.children}
    </InstructorLayout>
  );
}

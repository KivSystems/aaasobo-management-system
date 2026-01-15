import SideNav from "@/app/components/layouts/sideNav/SideNav";
import CustomerLayout from "./CustomerLayout";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <CustomerLayout
      sideNav={<SideNav userId={customerId} userType="customer" />}
    >
      {props.children}
    </CustomerLayout>
  );
}

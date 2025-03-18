import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";

const ClassesPage = ({ params }: { params: { id: string } }) => {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    // TODO: Handle the error properly
    throw new Error("Invalid customerId");
  }

  return <ClassCalendar customerId={customerId} />;
};

export default ClassesPage;

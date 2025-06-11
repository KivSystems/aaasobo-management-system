import BookClass from "@/app/components/customers-dashboard/classes/BookClass";
import { getInstructorAvailabilities } from "@/app/helper/api/classesApi";
import {
  INVALID_CLASS_ID,
  INVALID_CUSTOMER_ID,
} from "@/app/helper/messages/customerDashboard";

async function RebookPage({
  params,
}: {
  params: { id: string; classId: string };
}) {
  const customerId = parseInt(params.id);
  const classId = parseInt(params.classId);

  if (isNaN(customerId)) {
    console.error(`Invalid customer ID: ID = ${customerId}`);
    throw new Error(INVALID_CUSTOMER_ID);
  }

  if (isNaN(classId)) {
    console.error(`Invalid class ID: ID = ${classId}`);
    throw new Error(INVALID_CLASS_ID);
  }

  const instructorAvailabilities = await getInstructorAvailabilities(classId);

  return (
    <>
      <BookClass customerId={customerId} />
      {instructorAvailabilities.map((availability) => (
        <h4>{availability.dateTime.toString()}</h4>
      ))}
    </>
  );
}

export default RebookPage;

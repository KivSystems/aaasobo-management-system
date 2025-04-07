import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";
import {
  CUSTOMER_CLASSES_INVALID_ID,
  INVALID_ID,
} from "@/app/helper/messages/customerDashboard";

const ClassesPage = ({ params }: { params: { id: string } }) => {
  const customerId = parseInt(params.id);

  if (isNaN(customerId)) {
    console.error(`${CUSTOMER_CLASSES_INVALID_ID}: ID = ${customerId}`);
    throw new Error(INVALID_ID);
  }

  return <ClassCalendar customerId={customerId} />;
};

export default ClassesPage;

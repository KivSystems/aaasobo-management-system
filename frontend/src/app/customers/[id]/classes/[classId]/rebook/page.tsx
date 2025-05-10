import {
  INVALID_CLASS_ID,
  INVALID_CUSTOMER_ID,
} from "@/app/helper/messages/customerDashboard";

const RebookPage = ({
  params,
}: {
  params: { id: string; classId: string };
}) => {
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

  return <h3>Rebook Page: Class ID: {classId}</h3>;
};

export default RebookPage;

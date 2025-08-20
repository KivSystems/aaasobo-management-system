import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

const ClassesPage = async ({ params }: { params: { id: string } }) => {
  // Authenticate user session
  const userSessionType: UserType = await authenticateUserSession(
    "customer",
    params.id,
  );
  const customerId = parseInt(params.id);

  return (
    <ClassCalendar customerId={customerId} userSessionType={userSessionType} />
  );
};

export default ClassesPage;

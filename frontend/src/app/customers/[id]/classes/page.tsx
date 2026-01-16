import ClassCalendar from "@/components/customers-dashboard/classes/ClassCalendar";
import { authenticateUserSession } from "@/lib/auth/sessionUtils";

const ClassesPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
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

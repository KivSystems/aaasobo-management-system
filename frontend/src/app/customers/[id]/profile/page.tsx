import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getCustomerById } from "@/app/helper/api/customersApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";
import { getCookie } from "../../../../proxy";

async function CustomerProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Authenticate user session
  await authenticateUserSession("customer", params.id);
  const customerId = parseInt(params.id);

  // Get the cookies from the request headers
  const cookie = await getCookie();

  const customerProfile = await getCustomerById(customerId, cookie);

  return (
    <main>
      <Breadcrumb
        links={[{ label: { ja: "プロフィール", en: "Profile" } }]}
        className="profile"
      />
      <CustomerProfile customerProfile={customerProfile} />
    </main>
  );
}

export default CustomerProfilePage;

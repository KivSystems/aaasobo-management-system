import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getCustomerById } from "@/app/helper/api/customersApi";
import { INVALID_CUSTOMER_ID } from "@/app/helper/messages/customerDashboard";

async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);

  if (isNaN(customerId)) {
    console.error(`Invalid customer ID: ID = ${customerId}`);
    throw new Error(INVALID_CUSTOMER_ID);
  }

  const customerProfile = await getCustomerById(customerId);

  return (
    <main>
      <Breadcrumb
        links={[{ label: { ja: "プロフィール", en: "Profile" } }]}
        className="customerProfile"
      />
      <CustomerProfile customerProfile={customerProfile} />
    </main>
  );
}

export default CustomerProfilePage;

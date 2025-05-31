import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import { getCustomerById } from "@/app/helper/api/customersApi";

async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  const customerProfile = await getCustomerById(customerId);

  return (
    <main>
      <Breadcrumb
        links={[{ label: { ja: "プロフィール", en: "Customer Profile" } }]}
        className="customerProfile"
      />
      <CustomerProfile customerProfile={customerProfile} />
    </main>
  );
}

export default CustomerProfilePage;

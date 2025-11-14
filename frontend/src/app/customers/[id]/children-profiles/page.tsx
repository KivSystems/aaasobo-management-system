import ChildrenProfiles from "@/app/components/customers-dashboard/children-profiles/ChildrenProfiles";
import { INVALID_CUSTOMER_ID } from "@/app/helper/messages/customerDashboard";
import Breadcrumb from "@/app/components/elements/breadcrumb/Breadcrumb";
import {
  getChildProfiles,
  getCustomerById,
} from "@/app/helper/api/customersApi";
import { getCookie } from "../../../../middleware";

async function ChildrenProfilesPage({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);

  if (isNaN(customerId)) {
    console.error(`Invalid customer ID: ID = ${customerId}`);
    throw new Error(INVALID_CUSTOMER_ID);
  }

  // Get the cookies from the request headers
  const cookie = await getCookie();

  const customerProfile = await getCustomerById(customerId, cookie);
  const childProfiles = await getChildProfiles(customerId, cookie);

  return (
    <main>
      <Breadcrumb
        links={[
          { label: { ja: "お子さまプロフィール", en: "Children's Profiles" } },
        ]}
        className="profile"
      />
      <ChildrenProfiles
        customerId={customerId}
        childProfiles={childProfiles}
        terminationAt={customerProfile.terminationAt ?? null}
      />
    </main>
  );
}

export default ChildrenProfilesPage;

import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllCustomers } from "@/app/helper/api/adminsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

export default async function Page({ params }: { params: { id: string } }) {
  // Authenticate user session
  const adminId = params.id;
  await authenticateUserSession("admin", adminId);

  // Define table configuration
  const listType = "Customer List";
  const omitItems = ["ID"]; // Omit the item from the table
  const linkItems = ["Customer"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/customer-list/[ID]`]; // Set the link URL
  const userType = "admin"; // Set the user type for the registration form (It's not used in this page, but kept for consistency)
  const isAddButton = false; // Enable the add button
  const data = await getAllCustomers(); // Fetch all customers data

  return (
    <div>
      <ListTable
        listType={listType}
        fetchedData={data}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
        userType={userType}
        isAddButton={isAddButton}
      />
    </div>
  );
}

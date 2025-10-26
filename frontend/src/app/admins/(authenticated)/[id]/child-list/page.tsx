import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllChildren } from "@/app/helper/api/adminsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";
import { getCookie } from "../../../../../middleware";

export default async function Page({ params }: { params: { id: string } }) {
  // Authenticate user session
  const adminId = params.id;
  await authenticateUserSession("admin", adminId);

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Define table configuration
  const listType = "Child List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["Customer ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/customer-list/[Customer ID]`]; // Set the link URL
  const userType = "admin"; // Set the user type for the registration form (It's not used in this page, but kept for consistency)
  const isAddButton = false; // Enable the add button
  const data = await getAllChildren(cookie); // Fetch all children data

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

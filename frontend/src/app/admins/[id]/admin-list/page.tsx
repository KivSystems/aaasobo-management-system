import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllAdmins } from "@/app/helper/api/adminsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";
import { getCookie } from "../../../../proxy";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Authenticate user session
  const adminId = params.id;
  await authenticateUserSession("admin", adminId);

  // Get the cookies from the request headers
  const cookie = await getCookie();

  // Define table configuration
  const listType = "Admin List";
  const omitItems = ["ID"]; // Omit the item from the table
  const linkItems = ["Admin"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/admin-list/[ID]`]; // Set the link URL
  const userType = "admin"; // Set the user type for the registration form
  const isAddButton = true; // Enable the add button
  const data = await getAllAdmins(cookie); // Fetch all admins data

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

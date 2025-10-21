import ListTable from "@/app/components/admins-dashboard/ListTable";
import {
  getAllCustomers,
  getAllPastCustomers,
} from "@/app/helper/api/adminsApi";
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
  const userType = "customer"; // Set the user type for the registration form (It's not used in this page, but kept for consistency)
  const isAddButton = false; // Enable the add button
  const isViewPastButton = true; // Enable the view past information button
  const currentCustomers = await getAllCustomers(); // Fetch all customers data
  const pastCustomers = await getAllPastCustomers(); // Fetch all past customers data
  // Define past list table configuration
  const pastListTableProps = {
    listType: "Past Customer List",
    omitItems: ["ID"],
    linkItems: ["Past Customer"],
    replaceItems: ["ID"],
    linkUrls: [`/admins/${adminId}/customer-list/[ID]`],
    userType: userType as UserType,
    linkTarget: "_blank",
    width: "100vh",
  };

  return (
    <div>
      <ListTable
        listType={listType}
        fetchedData={currentCustomers}
        fetchedPastData={pastCustomers}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
        userType={userType}
        isAddButton={isAddButton}
        isViewPastButton={isViewPastButton}
        pastListTableProps={pastListTableProps}
      />
    </div>
  );
}

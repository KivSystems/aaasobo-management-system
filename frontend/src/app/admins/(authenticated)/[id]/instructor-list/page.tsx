import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllInstructors } from "@/app/helper/api/adminsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

export default async function Page({ params }: { params: { id: string } }) {
  // Authenticate user session
  const adminId = params.id;
  await authenticateUserSession("admin", adminId);

  // Define table configuration
  const listType = "Instructor List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/instructor-list/[ID]`]; // Set the link URL
  const userType = "instructor"; // Set the user type for the registration form
  const isAddButton = true; // Enable the add button
  const data = await getAllInstructors(); // Fetch all instructors data

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

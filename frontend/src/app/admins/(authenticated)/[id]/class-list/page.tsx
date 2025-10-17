import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllClasses } from "@/app/helper/api/adminsApi";
import { authenticateUserSession } from "@/app/helper/auth/sessionUtils";

export default async function Page({ params }: { params: { id: string } }) {
  // Authenticate user session
  const adminId = params.id;
  await authenticateUserSession("admin", adminId);

  // Define table configuration
  const listType = "Class List";
  const omitItems = ["ID", "InstructorID", "CustomerID"]; // Omit the item from the table
  const linkItems = ["Date/Time (JST)", "Instructor", "Customer"]; // Set the item to be a link
  const replaceItems = ["ID", "InstructorID", "CustomerID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [
    `/admins/${adminId}/class-list/[ID]`,
    `/admins/${adminId}/instructor-list/[InstructorID]`,
    `/admins/${adminId}/customer-list/[CustomerID]`,
  ]; // Set the link URL
  const userType = "admin"; // Set the user type for the registration form (It's not used in this page, but kept for consistency)
  const isAddButton = true; // Enable the add button
  const data = await getAllClasses(); // Fetch all classes data

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

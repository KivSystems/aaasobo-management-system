import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllAdmins } from "@/app/helper/api/adminsApi";

export default async function Page() {
  const listType = "Admin List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = ["/admins/admin-list/[ID]"]; // Set the link URL
  const addUserLink = ["/admins/admin-list/register", "Add admin"]; // Set the link URL and name to add a user
  const data = await getAllAdmins(); // Fetch all admins data

  return (
    <div>
      <ListTable
        listType={listType}
        fetchedData={data}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
        addUserLink={addUserLink}
      />
    </div>
  );
}

import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllEvents } from "@/app/helper/api/adminsApi";

export default async function Page({ params }: { params: { id: string } }) {
  const adminId = parseInt(params.id);
  const listType = "Event List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/event-list/[ID]`]; // Set the link URL
  const userType = "admin"; // Set the user type for the registration form
  const categoryType = "event"; // Set the category type for the registration form
  const data = await getAllEvents(); // Fetch all events data

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
        categoryType={categoryType}
      />
    </div>
  );
}

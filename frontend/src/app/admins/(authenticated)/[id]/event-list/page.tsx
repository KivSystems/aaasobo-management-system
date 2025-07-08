import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllEvents } from "@/app/helper/api/adminsApi";

export default async function Page({ params }: { params: { id: string } }) {
  const adminId = parseInt(params.id);
  const listType = "Event List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/event-list/[ID]`]; // Set the link URL
  const addUserLink = [`/admins/${adminId}/event-list/register`, "Add event"]; // Set the link URL and name to add a user
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
        addUserLink={addUserLink}
      />
    </div>
  );
}

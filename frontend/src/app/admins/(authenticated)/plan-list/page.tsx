import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllPlans } from "@/app/helper/api/adminsApi";

export default async function Page() {
  const listType = "Plan List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = [""]; // Set the item to be a link
  const replaceItems = [""]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [""]; // Set the link URL
  const data = await getAllPlans(); // Fetch all plans data

  return (
    <div>
      <ListTable
        listType={listType}
        fetchedData={data}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
      />
    </div>
  );
}

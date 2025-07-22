import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllPlans } from "@/app/helper/api/adminsApi";

export default async function Page({ params }: { params: { id: string } }) {
  const adminId = parseInt(params.id);
  const listType = "Plan List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [`/admins/${adminId}/plan-list/[ID]`]; // Set the link URL
  const addUserLink = [`/admins/${adminId}/plan-list/register`, "Add plan"]; // Set the link URL and name to add a user
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
        addUserLink={addUserLink}
      />
    </div>
  );
}

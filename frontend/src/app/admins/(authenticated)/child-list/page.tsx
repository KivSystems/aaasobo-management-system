"use client";

import ListTable from "@/app/components/admins-dashboard/ListTable";

function Page() {
  const listType = "Child List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["Customer ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = ["/admins/customer-list/[Customer ID]"]; // Set the link URL

  return (
    <div>
      <ListTable
        listType={listType}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
      />
    </div>
  );
}

export default Page;

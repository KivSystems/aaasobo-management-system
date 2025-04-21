"use client";

import ListTable from "@/app/components/admins-dashboard/ListTable";

function Page() {
  const listType = "Class List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = [""]; // Set the item to be a link
  const replaceItems = [""]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = [""]; // Set the link URL

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

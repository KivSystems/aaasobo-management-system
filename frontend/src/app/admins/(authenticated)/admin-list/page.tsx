"use client";

import UsersTable from "@/app/components/admins-dashboard/UsersTable";

function Page() {
  const userType = "Admin List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = [""]; // Set the item to be a link
  const replaceItems = ["Admin ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = ["/admins/customer-list/[Admin ID]"]; // Set the link URL

  return (
    <div>
      <UsersTable
        userType={userType}
        omitItems={omitItems}
        linkItems={linkItems}
        linkUrls={linkUrls}
        replaceItems={replaceItems}
      />
    </div>
  );
}

export default Page;

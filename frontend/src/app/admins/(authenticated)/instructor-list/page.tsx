"use client";

import ListTable from "@/app/components/admins-dashboard/ListTable";
import { getAllInstructors } from "@/app/helper/api/adminsApi";
import { useEffect, useState } from "react";

export default function Page() {
  const listType = "Instructor List";
  const omitItems = [""]; // Omit the item from the table
  const linkItems = ["ID"]; // Set the item to be a link
  const replaceItems = ["ID"]; // Replace the item with the value(e.g., ID -> 1,2,3...)
  const linkUrls = ["/admins/instructor-list/[ID]"]; // Set the link URL
  const addUserLink = ["/admins/instructor-list/register", "Add instructor"]; // Set the link URL and name to add a user
  const [data, setData] = useState<Instructor[]>([]);

  useEffect(() => {
    try {
      const fetchInstructors = async () => {
        const instructors = await getAllInstructors(); // Fetch all instructors data
        setData(instructors);
      };

      fetchInstructors();
    } catch (error) {
      console.error("Failed to fetch the instructor data.");
    }
  }, []);

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

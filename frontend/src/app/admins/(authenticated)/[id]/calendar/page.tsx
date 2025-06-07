"use client";

import { useEffect, useState, useContext } from "react";
import InstructorSearch from "@/app/components/admins-dashboard/InstructorSearch";
import InstructorCalendarForAdmin from "@/app/components/admins-dashboard/InstructorCalendarForAdmin";

const Page = () => {
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [instructorName, setInstructorName] = useState<string | null>(null);

  // Check the authentication of the admin.
  const isAuthenticated = true;

  const handleSendInstructor = async (id: number, name: string) => {
    localStorage.setItem("activeInstructor", [String(id), name].join(","));
    setInstructorId(id);
    setInstructorName(name);
  };

  useEffect(() => {
    const activeInstructor = localStorage.getItem("activeInstructor");

    if (activeInstructor === null) {
      return;
    }
    const [id, name] = activeInstructor.split(",");
    setInstructorId(parseInt(id));
    setInstructorName(name);
  }, []);

  return (
    <>
      {isAuthenticated && (
        <InstructorSearch handleSendInstructor={handleSendInstructor} />
      )}
      <InstructorCalendarForAdmin
        instructorId={instructorId}
        name={instructorName}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default Page;

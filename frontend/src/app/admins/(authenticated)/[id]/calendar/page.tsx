"use client";

import { useEffect, useState } from "react";
import InstructorSearch from "@/app/components/admins-dashboard/InstructorSearch";
import InstructorCalendarForAdmin from "@/app/components/admins-dashboard/InstructorCalendarForAdmin";
import { initialSetup } from "@/app/helper/utils/initialSetup";

const Page = ({ params }: { params: { id: string } }) => {
  const adminId = parseInt(params.id);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [instructorName, setInstructorName] = useState<string | null>(null);

  // Set the authentication status as true.
  const isAuthenticated = true;

  // Perform initial setup for the admin user
  initialSetup("admin");

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
        adminId={adminId}
        instructorId={instructorId}
        name={instructorName}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default Page;

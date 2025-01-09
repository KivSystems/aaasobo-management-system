"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/admins/(authenticated)/authContext";
import RescheduleClass from "@/app/components/customers-dashboard/classes/RescheduleClass";

function Page({ params }: { params: { customerId: string; classId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const classId = parseInt(params.classId);
  if (isNaN(classId)) {
    throw new Error("Invalid classId");
  }

  // Check the authentication of the admin.
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <RescheduleClass
      customerId={customerId}
      classId={classId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
}

export default Page;

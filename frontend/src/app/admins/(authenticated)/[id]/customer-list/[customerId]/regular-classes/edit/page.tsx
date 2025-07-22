"use client";

import EditRegularClass from "@/app/components/customers-dashboard/regular-classes/EditRegularClass";

function Page({ params }: { params: { id: string; customerId: string } }) {
  const adminId = parseInt(params.id);
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <EditRegularClass
      adminId={adminId}
      customerId={customerId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
}

export default Page;

"use client";

import EditRegularClass from "@/app/components/customers-dashboard/regular-classes/EditRegularClass";

function Page({ params }: { params: { customerId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Check the authentication of the admin.
  const isAuthenticated = true;

  return (
    <EditRegularClass
      customerId={customerId}
      isAdminAuthenticated={isAuthenticated}
    />
  );
}

export default Page;

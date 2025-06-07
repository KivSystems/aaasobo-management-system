"use client";

import BookClass from "@/app/components/customers-dashboard/classes/BookClass";

function Page({ params }: { params: { customerId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Check the authentication of the admin.
  const isAuthenticated = true;

  return (
    <BookClass customerId={customerId} isAdminAuthenticated={isAuthenticated} />
  );
}

export default Page;

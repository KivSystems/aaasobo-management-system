"use client";

import AddChildForm from "@/app/components/customers-dashboard/children-profiles/AddChildForm";

function Page({
  params,
}: {
  params: { id: string; customerId: string; childId: string };
}) {
  const adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <>
      <div>
        <h1>Add Child</h1>
      </div>
      <AddChildForm
        adminId={adminId}
        customerId={customerId}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
}

export default Page;

"use client";

import EditChildProfile from "@/app/components/customers-dashboard/children-profiles/EditChildProfile";

function Page({ params }: { params: { customerId: string; childId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const childId = parseInt(params.childId);
  if (isNaN(childId)) {
    throw new Error("Invalid childId");
  }

  // Set the authentication status as true.
  const isAuthenticated = true;

  return (
    <>
      <div>
        <h1>Edit Child</h1>
      </div>
      <EditChildProfile
        customerId={customerId}
        childId={childId}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
}

export default Page;

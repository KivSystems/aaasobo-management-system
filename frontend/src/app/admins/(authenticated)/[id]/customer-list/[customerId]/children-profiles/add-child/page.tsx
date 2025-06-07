"use client";

import AddChildForm from "@/app/components/customers-dashboard/children-profiles/AddChildForm";

function Page({ params }: { params: { customerId: string; childId: string } }) {
  const customerId = parseInt(params.customerId);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  // Check the authentication of the admin.
  const isAuthenticated = true;

  return (
    <>
      <div>
        <h1>Add Child</h1>
      </div>
      <AddChildForm
        customerId={customerId}
        isAdminAuthenticated={isAuthenticated}
      />
    </>
  );
}

export default Page;

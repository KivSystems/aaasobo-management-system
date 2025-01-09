"use client";

import EditChildProfile from "@/app/components/customers-dashboard/children-profiles/EditChildProfile";

function Page({ params }: { params: { id: string; childId: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const childId = parseInt(params.childId);
  if (isNaN(childId)) {
    throw new Error("Invalid childId");
  }

  return (
    <>
      <div>
        <h1>Edit Child</h1>
      </div>
      <EditChildProfile customerId={customerId} childId={childId} />
    </>
  );
}

export default Page;

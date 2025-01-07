"use client";

import RescheduleClass from "@/app/components/customers-dashboard/classes/RescheduleClass";

function Page({ params }: { params: { id: string; classId: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const classId = params.classId;

  return <RescheduleClass customerId={customerId} classId={classId} />;
}

export default Page;

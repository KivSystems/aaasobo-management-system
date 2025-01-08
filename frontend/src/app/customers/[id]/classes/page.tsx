"use client";

import ClassCalendar from "@/app/components/customers-dashboard/classes/ClassCalendar";

const Page = ({ params }: { params: { id: string } }) => {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return <ClassCalendar customerId={customerId} />;
};

export default Page;

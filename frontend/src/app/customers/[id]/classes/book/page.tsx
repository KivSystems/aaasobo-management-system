"use client";

import BookClass from "@/app/components/customers-dashboard/classes/BookClass";

function Page({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return <BookClass customerId={customerId} />;
}

export default Page;

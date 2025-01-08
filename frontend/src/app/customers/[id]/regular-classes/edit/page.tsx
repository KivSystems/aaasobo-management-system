"use client";

import EditRegularClass from "@/app/components/customers-dashboard/regular-classes/EditRegularClass";
import InstructorsSchedule from "@/app/components/customers-dashboard/regular-classes/InstructorsSchedule";
import styles from "./page.module.scss";

function Page({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <div>
      <div className={styles.header}>Editing Regular Classes</div>
      <EditRegularClass customerId={customerId} />
      <InstructorsSchedule />
    </div>
  );
}

export default Page;

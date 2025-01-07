"use client";

import ChildrenProfiles from "@/app/components/customers-dashboard/children-profiles/ChildrenProfiles";
import styles from "./page.module.scss";

function Page({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <>
      <div className={styles.header}>Children&apos;s Profiles</div>
      <ChildrenProfiles customerId={customerId} />
    </>
  );
}

export default Page;

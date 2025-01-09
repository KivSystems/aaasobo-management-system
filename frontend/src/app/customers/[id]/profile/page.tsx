import CustomerProfile from "@/app/components/customers-dashboard/profile/CustomerProfile";
import styles from "./page.module.scss";

function Page({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <>
      <div className={styles.pageTitle}>Customer Profile</div>
      <CustomerProfile customerId={customerId} />
    </>
  );
}

export default Page;

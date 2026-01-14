import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SideNav userId={customerId} userType="customer" />
      </div>
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}

import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    throw new Error("Invalid adminId");
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SideNav userId={adminId} userType="admin" />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

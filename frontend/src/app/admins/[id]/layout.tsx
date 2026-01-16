import styles from "./layout.module.scss";
import SideNav from "@/components/layouts/sideNav/SideNav";
import { getUserSession } from "@/lib/auth/sessionUtils";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  // Get the admin id from the URL parameters
  let adminId = parseInt(params.id);
  if (isNaN(adminId)) {
    // Get admin id from session
    const session = await getUserSession("admin");

    // If session is not found or user id is not present, throw an error
    if (!session || !session.user.id) {
      throw new Error("Invalid adminId");
    }
    adminId = parseInt(session.user.id);
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SideNav userId={adminId} userType="admin" />
      </div>
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}

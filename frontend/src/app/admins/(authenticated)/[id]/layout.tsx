import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";
import { getUserSession } from "@/app/helper/auth/sessionUtils";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  // Get the admin id from the URL parameters
  let adminId = parseInt(params.id);
  console.log("Layout.tsx params.id", params.id);
  if (isNaN(adminId)) {
    // Get admin id from session
    const session = await getUserSession("admin");

    // If session is not found or user id is not present, throw an error
    if (!session || !session.user.id) {
      throw new Error("Invalid adminId");
    }
    adminId = parseInt(session.user.id);
    console.log("Layout.tsx adminId from session", adminId);
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

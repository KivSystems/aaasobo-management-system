import styles from "./layout.module.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideNav from "@/app/components/layouts/sideNav/SideNav";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const instructorId = parseInt(params.id);
  if (isNaN(instructorId)) {
    throw new Error("Invalid instructorId");
  }

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.sidebar}>
        <SideNav userId={instructorId} userType="instructor" />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

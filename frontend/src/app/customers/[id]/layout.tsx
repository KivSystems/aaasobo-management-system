import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.sidebar}>
        <SideNav userId={customerId} userType="customer" />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

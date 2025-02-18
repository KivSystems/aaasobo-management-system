import { signOut } from "../../../../../auth.config";
import styles from "./SideNav.module.scss";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogOut({ userType }: { userType: UserType }) {
  return (
    <form
      // className={`${styles.link} ${styles.logout}`}
      className={styles.logout}
      action={async () => {
        "use server";
        await signOut({ redirectTo: `/${userType}s/login` });
      }}
    >
      <button className={styles.link} type="submit">
        <ArrowLeftStartOnRectangleIcon className={styles.icon} />
        <span className={styles.linkText}>Log Out</span>
      </button>
    </form>
  );
}

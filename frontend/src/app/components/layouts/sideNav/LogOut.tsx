import { signOut } from "../../../../../auth.config";
import styles from "./SideNav.module.scss";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogOut({ userType }: { userType: UserType }) {
  return (
    <form
      className={`${styles.link} ${styles.logout}`}
      action={async () => {
        "use server";
        await signOut({ redirectTo: `/${userType}s/login` });
      }}
    >
      <ArrowLeftStartOnRectangleIcon className={styles.icon} />
      <button className={styles.linkText} type="submit">
        Log Out
      </button>
    </form>
  );
}

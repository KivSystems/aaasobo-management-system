import { getUserName } from "@/app/helper/api/usersApi";
import styles from "./SideNav.module.scss";

export default async function UserName({
  userId,
  userType,
}: {
  userId: number;
  userType: "admin" | "customer" | "instructor";
}) {
  const userName = getUserName(userId, userType);

  return <div className={styles.sideNavUser__name}>{userName}</div>;
}

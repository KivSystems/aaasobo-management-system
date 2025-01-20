import styles from "./SideNav.module.scss";
import Image from "next/image";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import NavLinks from "./NavLinks";
import LogOut from "./LogOut";

export default function SideNav({
  userId,
  userType,
  userName,
}: {
  userId: number;
  userType: "admin" | "customer" | "instructor";
  userName: string;
}) {
  return (
    <div className={styles.sideNavContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.sideNavLogo}>
          <Image
            className={styles.sideNavLogo__img}
            src="/images/logo2.svg"
            alt="Aaasobo logo"
            width={183}
            height={51}
          />
        </div>

        <div className={styles.sideNavUser}>
          <UserIconSolid className={styles.sideNavUser__icon} />
          <div className={styles.sideNavUser__name}>{userName}</div>
        </div>

        <NavLinks userId={userId} userType={userType} />

        <LogOut userType={userType} />
      </div>
    </div>
  );
}

import styles from "./SideNav.module.scss";
import Image from "next/image";
import NavLinks from "./NavLinks";
import LogOut from "./LogOut";
import UserName from "./UserName";

export default function SideNav({
  userId,
  userType,
}: {
  userId: number;
  userType: "admin" | "customer" | "instructor";
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
        <UserName userId={userId} userType={userType} />
        <NavLinks userId={userId} userType={userType} />
        <LogOut userType={userType} />
      </div>
    </div>
  );
}

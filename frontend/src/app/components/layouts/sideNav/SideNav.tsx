import styles from "./SideNav.module.scss";
import Image from "next/image";
import NavLinks from "./NavLinks";
import LogOut from "./LogOut";
import UserName from "./UserName";
import { getCustomerById } from "@/app/helper/api/customersApi";
import { getInstructorProfile } from "@/app/helper/api/instructorsApi";
import LanguageSwitcher from "../../elements/languageSwitcher/LanguageSwitcher";

export default async function SideNav({
  userId,
  userType,
}: {
  userId: number;
  userType: UserType;
}) {
  let userName = "Admin";
  if (userType === "customer") {
    const customer = await getCustomerById(userId);
    userName = customer.name;
  } else {
    const instructor = await getInstructorProfile(userId);
    userName = instructor.nickname;
  }

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
        <UserName userType={userType} userName={userName} />
        <NavLinks userId={userId} userType={userType} />
        {userType === "customer" && <LanguageSwitcher />}
        <LogOut userType={userType} />
      </div>
    </div>
  );
}

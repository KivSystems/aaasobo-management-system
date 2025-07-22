"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import styles from "./SideNav.module.scss";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";

export default function UserName({
  userType,
  userName,
}: {
  userType: UserType;
  userName: string;
}) {
  const { language } = useLanguage();
  return (
    <div className={styles.sideNavUser}>
      <UserIconSolid className={styles.sideNavUser__icon} />
      <div className={styles.sideNavUser__name}>
        {userType === "customer" && language === "ja"
          ? `${userName} 様`
          : userName}
      </div>
    </div>
  );
}

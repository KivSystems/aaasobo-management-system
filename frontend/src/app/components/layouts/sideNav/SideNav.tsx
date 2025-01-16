// "use client";

import styles from "./SideNav.module.scss";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { FC, SVGProps } from "react";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import NavLinks from "./NavLinks";

export default function SideNav({
  // links,
  // userName,
  // logout,
  customerId,
}: {
  // links: LinkProps[];
  // userName: string;
  // logout: () => void;
  customerId: number;
}) {
  // const pathname = usePathname();

  return (
    <div className={styles.sideNavContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.sideNavLogo}>
          <Image
            className={styles.sideNavLogo__img}
            src="/images/logo2.svg"
            alt="My SVG Image"
            width={183}
            height={51}
          />
        </div>

        <div className={styles.sideNavUser}>
          <UserIconSolid className={styles.sideNavUser__icon} />
          {/* <div className={styles.sideNavUser__name}>{userName}</div> */}
        </div>

        <NavLinks customerId={customerId} />

        {/* <div className={`${styles.link} ${styles.logout}`} onClick={logout}> */}
        <div className={`${styles.link} ${styles.logout}`}>
          <ArrowLeftStartOnRectangleIcon className={styles.icon} />
          <p className={styles.linkText}>Log Out</p>
        </div>
      </div>
    </div>
  );
}

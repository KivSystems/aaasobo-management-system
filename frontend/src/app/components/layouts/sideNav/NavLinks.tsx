"use client";

import styles from "./SideNav.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { getLinks } from "@/app/helper/data/navLinks";

export default function NavLinks({
  userId,
  userType,
}: {
  userId: number;
  userType: "admin" | "customer" | "instructor";
}) {
  const pathname = usePathname();
  const links = getLinks(userId, userType);

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            // clsx is used for conditional rendering
            className={clsx(styles.link, {
              [styles.active]: pathname.startsWith(link.href),
            })}
          >
            <LinkIcon className={styles.icon} />
            <p className={styles.linkText}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

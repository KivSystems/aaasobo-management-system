"use client";

import styles from "./SideNav.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function NavLinks({ links }: { links: LinkType[] }) {
  const pathname = usePathname();

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
              [styles.active]: pathname === link.href,
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

"use client";

import { FC, SVGProps } from "react";
import styles from "./SideNav.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Link = {
  name: string;
  href: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

export default function NavLinks({ userId }: { userId: number }) {
  const pathname = usePathname();

  const links: Link[] = [
    {
      name: "Class Calendar",
      href: `/customers/${userId}/classes`,
      icon: CalendarDaysIcon,
    },
    {
      name: "Customer Profile",
      href: `/customers/${userId}/profile`,
      icon: UserIcon,
    },
    {
      name: "Children's Profiles",
      href: `/customers/${userId}/children-profiles`,
      icon: UsersIcon,
    },
    {
      name: "Regular Classes",
      href: `/customers/${userId}/regular-classes`,
      icon: ClipboardDocumentListIcon,
    },
  ];

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

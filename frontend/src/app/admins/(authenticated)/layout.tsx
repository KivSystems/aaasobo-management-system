"use client";

import { useRouter } from "next/navigation";
import styles from "./layout.module.scss";
import {
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { FC, SVGProps } from "react";
import { AdminAuthentication } from "@/app/helper/authenticationUtils";
import { AuthContext } from "./authContext";
import { logoutAdmin } from "@/app/helper/adminsApi";
import Loading from "@/app/components/Loading";
import ClientRenderedSideNav from "@/app/components/layouts/sideNav/ClientRenderedSideNav";

type Link = {
  name: string;
  href: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Check the authentication of the admin.
  const { isAuthenticated, isLoading } = AdminAuthentication();
  const router = useRouter();

  const links: Link[] = [
    {
      name: "Class Calendar",
      href: "/admins/calendar",
      icon: CalendarDaysIcon,
    },
    {
      name: "Instructor List",
      href: "/admins/instructor-list",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Customer List",
      href: "/admins/customer-list",
      icon: UsersIcon,
    },
    {
      name: "Child List",
      href: "/admins/child-list",
      icon: UserGroupIcon,
    },
  ];

  // Display a loading message while checking authentication.
  if (isLoading) {
    return <Loading />;
  }

  const logout = async () => {
    await logoutAdmin();
    router.push("/admins/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <ClientRenderedSideNav
            links={links}
            userName="Admin"
            logout={logout}
          />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </AuthContext.Provider>
  );
}

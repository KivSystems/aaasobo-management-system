"use client";

import { useRouter } from "next/navigation";
import styles from "./layout.module.scss";
import {
  UserIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { FC, SVGProps } from "react";
import { AdminAuthentication } from "@/app/helper/utils/authenticationUtils";
import { AuthContext } from "./authContext";
import { logoutAdmin } from "@/app/helper/api/adminsApi";
import Loading from "@/app/components/elements/loading/Loading";
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
      name: "Lesson List",
      href: "/admins/lesson-list",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: "Admin List",
      href: "/admins/admin-list",
      icon: UserIcon,
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
    {
      name: "Plan List",
      href: "/admins/plan-list",
      icon: AcademicCapIcon,
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

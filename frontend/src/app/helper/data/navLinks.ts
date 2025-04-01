import {
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export function getLinks(
  userId: number | null,
  userType: "admin" | "customer" | "instructor",
  language?: "ja" | "en",
): LinkType[] {
  const customerLinks: LinkType[] = [
    {
      name: language === "ja" ? "クラスカレンダー" : "Class Calendar",
      href: `/customers/${userId}/classes`,
      icon: CalendarDaysIcon,
    },
    {
      name: language === "ja" ? "プロフィール" : "Customer Profile",
      href: `/customers/${userId}/profile`,
      icon: UserIcon,
    },
    {
      name: language === "ja" ? "お子様プロフィール" : "Children's Profiles",
      href: `/customers/${userId}/children-profiles`,
      icon: UsersIcon,
    },
    {
      name: language === "ja" ? "レギュラークラス" : "Regular Classes",
      href: `/customers/${userId}/regular-classes`,
      icon: ClipboardDocumentListIcon,
    },
  ];

  const adminLinks: LinkType[] = [
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

  const instructorLinks: LinkType[] = [
    {
      name: "Class Schedule",
      href: `/instructors/${userId}/class-schedule`,
      icon: CalendarIcon,
    },
    {
      name: "Profile",
      href: `/instructors/${userId}/profile`,
      icon: UserIcon,
    },
    {
      name: "Availability Schedule",
      href: `/instructors/${userId}/availability`,
      icon: ClockIcon,
    },
  ];

  switch (userType) {
    case "admin":
      return [...adminLinks];
    case "instructor":
      return [...instructorLinks];
    default:
      return [...customerLinks];
  }
}

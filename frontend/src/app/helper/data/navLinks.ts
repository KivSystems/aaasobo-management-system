import {
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export function getLinks(
  userId: number | null,
  userType: "admin" | "customer" | "instructor",
): LinkType[] {
  const customerLinks: LinkType[] = [
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
      name: "Teaching Schedule",
      href: `/instructors/${userId}/schedule`,
      icon: CalendarDaysIcon,
    },
    // Add more instructor-specific links
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

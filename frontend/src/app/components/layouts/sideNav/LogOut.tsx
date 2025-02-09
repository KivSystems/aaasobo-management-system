"use client";

import { logoutCustomer } from "@/app/helper/customersApi";
import styles from "./SideNav.module.scss";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { logoutInstructor } from "@/app/helper/instructorsApi";
import { toast } from "react-toastify";
import { logoutAdmin } from "@/app/helper/adminsApi";

export default function LogOut({
  userType,
}: {
  userType: "admin" | "customer" | "instructor";
}) {
  const router = useRouter();

  const logoutActions = {
    admin: { logoutFn: logoutAdmin, redirectUrl: "/admins/login" },
    customer: { logoutFn: logoutCustomer, redirectUrl: "/customers/login" },
    instructor: {
      logoutFn: logoutInstructor,
      redirectUrl: "/instructors/login",
    },
  };

  const { logoutFn, redirectUrl } = logoutActions[userType];

  const handleLogout = async () => {
    if (!logoutFn) {
      toast.error("Invalid user type");
      return;
    }

    const result = await logoutFn();

    if (result?.ok) {
      router.push(redirectUrl);
    } else {
      toast.error(result?.error || "Logout failed");
    }
  };

  return (
    <div className={`${styles.link} ${styles.logout}`} onClick={handleLogout}>
      <ArrowLeftStartOnRectangleIcon className={styles.icon} />
      <p className={styles.linkText}>Log Out</p>
    </div>
  );
}

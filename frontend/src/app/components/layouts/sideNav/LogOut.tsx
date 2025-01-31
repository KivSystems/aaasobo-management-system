import { signOut } from "../../../../../auth.config";
import styles from "./SideNav.module.scss";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogOut({ userType }: { userType: UserType }) {
  return (
    <form
      className={`${styles.link} ${styles.logout}`}
      action={async () => {
        "use server";
        await signOut({ redirectTo: `/${userType}s/login` });
      }}
    >
      <ArrowLeftStartOnRectangleIcon className={styles.icon} />
      <button className={styles.linkText} type="submit">
        Log Out
      </button>
    </form>
  );
}

//
// "use client";

// import { logoutCustomer } from "@/app/helper/api/customersApi";
// import styles from "./SideNav.module.scss";
// import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
// import { useRouter } from "next/navigation";
// import { logoutInstructor } from "@/app/helper/api/instructorsApi";
// import { toast } from "react-toastify";
// import { logoutAdmin } from "@/app/helper/api/adminsApi";

// export default function LogOut({
//   userType,
// }: {
//   userType: "admin" | "customer" | "instructor";
// }) {
//   const router = useRouter();

//   const logoutActions = {
//     admin: { logoutFn: logoutAdmin, redirectUrl: "/admins/login" },
//     customer: { logoutFn: logoutCustomer, redirectUrl: "/customers/login" },
//     instructor: {
//       logoutFn: logoutInstructor,
//       redirectUrl: "/instructors/login",
//     },
//   };

//   const { logoutFn, redirectUrl } = logoutActions[userType] || {};

//   const handleLogout = async () => {
//     if (!logoutFn) {
//       toast.error("Invalid user type");
//       return;
//     }

//     const result = await logoutFn();

//     if (result?.ok) {
//       router.push(redirectUrl);
//     } else {
//       toast.error(result?.error || "Logout failed");
//     }
//   };

//   return (
//     <div className={`${styles.link} ${styles.logout}`} onClick={handleLogout}>
//       <ArrowLeftStartOnRectangleIcon className={styles.icon} />
//       <p className={styles.linkText}>Log Out</p>
//     </div>
//   );
// }

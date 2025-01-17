import styles from "./SideNav.module.scss";
import Image from "next/image";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import NavLinks from "./NavLinks";
import { handleLogout } from "@/app/helper/actions";

export default function SideNav({
  userType,
  userName,
  links,
}: {
  userType: "admin" | "customer" | "instructor";
  userName: string;
  links: LinkType[];
}) {
  const handleLogoutWithUserType = handleLogout.bind(null, userType);

  return (
    <div className={styles.sideNavContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.sideNavLogo}>
          <Image
            className={styles.sideNavLogo__img}
            src="/images/logo2.svg"
            alt="Aaasobo logo"
            width={183}
            height={51}
          />
        </div>

        <div className={styles.sideNavUser}>
          <UserIconSolid className={styles.sideNavUser__icon} />
          <div className={styles.sideNavUser__name}>{userName}</div>
        </div>

        <NavLinks links={links} />

        <form className={styles.logout} action={handleLogoutWithUserType}>
          <button className={`${styles.link} ${styles.logout}`} type="submit">
            <ArrowLeftStartOnRectangleIcon className={styles.icon} />
            <p className={styles.linkText}>Log Out</p>
          </button>
        </form>
      </div>
    </div>
  );
}

//
// // "use client";

// import styles from "./SideNav.module.scss";
// import Link from "next/link";
// import Image from "next/image";
// import clsx from "clsx";
// import { usePathname } from "next/navigation";
// import { FC, SVGProps } from "react";
// import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
// import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
// import NavLinks from "./NavLinks";
// import UserName from "./UserName";

// export default function SideNav({
//   // links,
//   // userName,
//   // logout,
//   userId,
//   userType,
// }: {
//   // links: LinkProps[];
//   // userName: string;
//   // logout: () => void;
//   userId: number;
//   userType: "admin" | "customer" | "instructor";
// }) {
//   // const pathname = usePathname();

//   return (
//     <div className={styles.sideNavContainer}>
//       <div className={styles.innerContainer}>
//         <div className={styles.sideNavLogo}>
//           <Image
//             className={styles.sideNavLogo__img}
//             src="/images/logo2.svg"
//             alt="Aaasobo logo"
//             width={183}
//             height={51}
//           />
//         </div>

//         <div className={styles.sideNavUser}>
//           <UserIconSolid className={styles.sideNavUser__icon} />
//           {/* <div className={styles.sideNavUser__name}>{userName}</div> */}
//           <UserName userId={userId} userType={userType} />
//         </div>

//         <NavLinks userId={userId} />

//         {/* <div className={`${styles.link} ${styles.logout}`} onClick={logout}> */}
//         <div className={`${styles.link} ${styles.logout}`}>
//           <ArrowLeftStartOnRectangleIcon className={styles.icon} />
//           <p className={styles.linkText}>Log Out</p>
//         </div>
//       </div>
//     </div>
//   );
// }

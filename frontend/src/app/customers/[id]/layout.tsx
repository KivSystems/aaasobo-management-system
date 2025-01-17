import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./layout.module.scss";
import SideNav from "@/app/components/layouts/sideNav/SideNav";
import { getUserName } from "@/app/helper/api/usersApi";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }

  const customerName = await getUserName(customerId, "customer");

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.sidebar}>
        <SideNav
          userId={customerId}
          userType="customer"
          userName={customerName}
        />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

//
// "use client";

// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import styles from "./layout.module.scss";
// import {
//   UsersIcon,
//   CalendarDaysIcon,
//   ClipboardDocumentListIcon,
//   UserIcon,
// } from "@heroicons/react/24/outline";
// import { FC, SVGProps, useEffect, useState } from "react";
// import { getCustomerById, logoutCustomer } from "@/app/helper/customersApi";
// import { useRouter } from "next/navigation";
// import { CustomerAuthentication } from "@/app/helper/authenticationUtils";
// import Loading from "@/app/components/Loading";
// import SideNav from "@/app/components/layouts/sideNav/SideNav";

// // type Link = {
// //   name: string;
// //   href: string;
// //   icon: FC<SVGProps<SVGSVGElement>>;
// // };

// export default function Layout({
//   children,
//   params,
// }: {
//   children: React.ReactNode;
//   params: { id: string };
// }) {
//   // const [customerName, setCustomerName] = useState<string | null>(null);
//   // const router = useRouter();
//   const customerId = parseInt(params.id);
//   if (isNaN(customerId)) {
//     throw new Error("Invalid customerId");
//   }

//   // Check the authentication of the customer.
//   // const { isLoading } = CustomerAuthentication(customerId);

//   // const links: Link[] = [
//   //   {
//   //     name: "Class Calendar",
//   //     href: `/customers/${customerId}/classes`,
//   //     icon: CalendarDaysIcon,
//   //   },
//   //   {
//   //     name: "Customer Profile",
//   //     href: `/customers/${customerId}/profile`,
//   //     icon: UserIcon,
//   //   },
//   //   {
//   //     name: "Children's Profiles",
//   //     href: `/customers/${customerId}/children-profiles`,
//   //     icon: UsersIcon,
//   //   },
//   //   {
//   //     name: "Regular Classes",
//   //     href: `/customers/${customerId}/regular-classes`,
//   //     icon: ClipboardDocumentListIcon,
//   //   },
//   // ];

//   // TODO: Get the customer name from the session?
//   // useEffect(() => {
//   //   const fetchCustomer = async () => {
//   //     const customer = await getCustomerById(customerId);
//   //     setCustomerName(customer.name);
//   //   };
//   //   fetchCustomer();
//   // }, [customerId]);

//   // const logout = async () => {
//   //   const result = await logoutCustomer();
//   //   if (result.ok) {
//   //     router.push("/customers/login");
//   //     return;
//   //   }
//   //   toast.error(result.error);
//   // };

//   // Display a loading message while checking authentication.
//   // if (isLoading) {
//   //   return <Loading />;
//   // }

//   return (
//     <div className={styles.container}>
//       <ToastContainer />
//       <div className={styles.sidebar}>
//         {/* {customerName && (
//           <SideNav links={links} userName={customerName} logout={logout} />
//         )} */}
//         <SideNav userId={customerId} userType="customer" />
//       </div>
//       <div className={styles.content}>{children}</div>
//     </div>
//   );
// }

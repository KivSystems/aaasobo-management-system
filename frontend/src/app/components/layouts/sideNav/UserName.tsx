import { getCustomerById } from "@/app/helper/api/customersApi";
import styles from "./SideNav.module.scss";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { getInstructorProfile } from "@/app/helper/api/instructorsApi";

export default async function UserName({
  userId,
  userType,
}: {
  userId: number;
  userType: UserType;
}) {
  async function fetchUserName(
    userId: number,
    userType: string,
  ): Promise<string> {
    try {
      if (userType === "customer") {
        const customerData = await getCustomerById(userId);
        return customerData?.name || "Customer";
      }
      if (userType === "instructor") {
        const instructorProfile = await getInstructorProfile(userId);
        return instructorProfile?.nickname || "Instructor";
      }
      return "Admin";
    } catch (error) {
      console.error(`Failed to fetch user data for ${userType}:`, error);
      return `Unknown ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
    }
  }

  const userName = await fetchUserName(userId, userType);

  return (
    <div className={styles.sideNavUser}>
      <UserIconSolid className={styles.sideNavUser__icon} />
      <div className={styles.sideNavUser__name}>{userName}</div>
    </div>
  );
}

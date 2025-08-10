"use client";

import styles from "./ListPageRegistrationModal.module.scss";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

const ListPageRegistrationModal = ({
  userType,
  categoryType,
  width = "100%",
}: {
  userType: UserType;
  categoryType?: CategoryType;
  width?: string;
}) => {
  return (
    <div className={styles.modalContent} style={{ width }}>
      <RegisterForm userType={userType} categoryType={categoryType} />
    </div>
  );
};

export default ListPageRegistrationModal;

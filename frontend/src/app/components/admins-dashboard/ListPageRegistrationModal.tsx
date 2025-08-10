"use client";

import styles from "./ListPageRegistrationModal.module.scss";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

const ListPageRegistrationModal = ({
  userType,
  categoryType,
}: {
  userType: UserType;
  categoryType?: CategoryType;
}) => {
  return (
    <div className={styles.modalContent}>
      <RegisterForm userType={userType} categoryType={categoryType} />
    </div>
  );
};

export default ListPageRegistrationModal;

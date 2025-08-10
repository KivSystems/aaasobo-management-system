"use client";

import styles from "./ListPageRegistrationModal.module.scss";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

const ListPageRegistrationModal = ({
  categoryType,
}: {
  categoryType?: CategoryType;
}) => {
  return (
    <div className={styles.modalContent}>
      <RegisterForm userType="admin" categoryType={categoryType} />
    </div>
  );
};

export default ListPageRegistrationModal;

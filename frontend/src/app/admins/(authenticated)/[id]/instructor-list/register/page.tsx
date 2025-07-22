import React from "react";
import styles from "./page.module.scss";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

function Register() {
  return (
    <main>
      <div className={styles.outsideContainer}>
        <div className={styles.container}>
          <h2>Instructor Registration</h2>
          <RegisterForm userType="instructor" />
        </div>
      </div>
    </main>
  );
}
export default Register;

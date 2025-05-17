import Image from "next/image";
import React from "react";
import styles from "./page.module.scss";
import LoginForm from "@/app/components/features/loginForm/LoginForm";

export default function LoginPage() {
  return (
    <main className={styles.outsideContainer}>
      <div className={styles.container}>
        <Image
          src={"/images/logo2.svg"}
          alt="logo"
          width={100}
          height={100}
          className={styles.logo}
          priority={true}
        />
        <h2>Login for instructors</h2>
        <LoginForm userType="instructor" language="en" />
      </div>
    </main>
  );
}

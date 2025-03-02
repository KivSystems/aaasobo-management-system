"use client";

import { useRouter } from "next/navigation";
import React from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

function Register() {
  const router = useRouter();

  return (
    <main>
      <div className={styles.outsideContainer}>
        <div className={styles.container}>
          <Image
            src={"/images/logo2.svg"}
            alt="logo"
            width={100}
            height={100}
            className={styles.logo}
            priority={true}
          />
          <h2>Create a free account</h2>
          <p className={styles.paragraph}>
            Already a member? <Link href="/customers/login">Log In</Link>
          </p>

          <RegisterForm userType="customer" />
        </div>
      </div>
    </main>
  );
}

export default Register;

"use client";

import React from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import RegisterForm from "@/app/components/features/registerForm/RegisterForm";

function Register() {
  const { language } = useLanguage();

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
          <h2>
            {language === "ja"
              ? "無料アカウントを作成"
              : "Create a free account"}
          </h2>
          <p className={styles.paragraph}>
            {language === "ja"
              ? "すでにアカウントをお持ちですか？"
              : "Already a member?"}{" "}
            <Link href="/customers/login">
              {language === "ja" ? "ログイン" : "Login"}
            </Link>
          </p>

          <RegisterForm userType="customer" language={language} />
        </div>
      </div>
    </main>
  );
}

export default Register;

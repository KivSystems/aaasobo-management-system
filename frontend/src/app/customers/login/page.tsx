"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./page.module.scss";
import LoginForm from "@/components/features/loginForm/LoginForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { language } = useLanguage();

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
        <h2>{language === "ja" ? "ログイン" : "Login"}</h2>
        <p>
          {language === "ja"
            ? "アカウントをお持ちでないですか？"
            : "Not a member yet?"}{" "}
          <Link href="/customers/register">
            {language === "ja" ? "登録する" : "Join us!"}
          </Link>
        </p>
        <LoginForm userType="customer" language={language} />
      </div>
    </main>
  );
}

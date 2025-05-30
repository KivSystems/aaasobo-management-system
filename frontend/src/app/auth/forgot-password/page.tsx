"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import ForgotPasswordForm from "@/app/components/features/forgotPasswordForm/ForgotPasswordForm";
import { PASSWORD_RESET_INSTRUCTION } from "@/app/helper/messages/formValidation";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function ForgotPasswordPage() {
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
        <h2>
          {language === "ja"
            ? "パスワード再設定のご案内"
            : "Password Reset Instructions"}
        </h2>
        <p className={styles.instruction}>
          {PASSWORD_RESET_INSTRUCTION[language]}
        </p>
        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <ForgotPasswordForm language={language} />
        </Suspense>
      </div>
    </main>
  );
}

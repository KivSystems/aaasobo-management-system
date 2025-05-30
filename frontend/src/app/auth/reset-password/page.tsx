"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import ResetPasswordForm from "@/app/components/features/resetPasswordForm/ResetPasswordForm";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function ResetPasswordPage() {
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
          {language === "ja" ? "パスワードを再設定" : "Reset Your Password"}
        </h2>
        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <ResetPasswordForm language={language} />
        </Suspense>
      </div>
    </main>
  );
}

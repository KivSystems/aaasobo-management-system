import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import ResetPasswordForm from "@/app/components/features/resetPasswordForm/ResetPasswordForm";

export default function ResetPasswordPage() {
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
        <h2>Reset Password</h2>
        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

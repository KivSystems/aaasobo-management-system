import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import ForgotPasswordForm from "@/app/components/features/forgotPasswordForm/ForgotPasswordForm";

export default function ForgotPasswordPage() {
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
        <h2>Forgot Password?</h2>
        <p className={styles.instruction}>
          Enter your registered email address and press Submit to receive a
          password reset link.
        </p>
        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

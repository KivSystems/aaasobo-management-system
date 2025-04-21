import { EmailVerificationForm } from "@/app/components/features/emailVerificationForm/EmailVerificationForm";
import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";

export default function EmailVerificationPage() {
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
        <h2>Email Verification</h2>
        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <EmailVerificationForm />
        </Suspense>
      </div>
    </main>
  );
}

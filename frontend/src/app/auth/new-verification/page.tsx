import { EmailVerificationForm } from "@/app/components/features/emailVerificationForm/EmailVerificationForm";
import styles from "./page.module.scss";
import Image from "next/image";

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
        <EmailVerificationForm />
      </div>
    </main>
  );
}

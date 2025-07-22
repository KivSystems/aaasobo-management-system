import { EmailVerificationForm } from "@/app/components/features/emailVerificationForm/EmailVerificationForm";
import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import { verifyCustomerEmail } from "@/app/helper/api/customersApi";

export default async function EmailVerificationPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  const resultMessage = await verifyCustomerEmail(token);

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

        <Suspense
          fallback={
            <div className={styles.loaderWrapper}>
              <Loading />
            </div>
          }
        >
          <EmailVerificationForm resultMessage={resultMessage} />
        </Suspense>
      </div>
    </main>
  );
}

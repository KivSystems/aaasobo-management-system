import { EmailVerificationForm } from "@/components/features/emailVerificationForm/EmailVerificationForm";
import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/components/elements/loading/Loading";
import { verifyCustomerEmail } from "@/lib/api/customersApi";

export default async function EmailVerificationPage(props: {
  params: Promise<{ token: string }>;
}) {
  const params = await props.params;
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

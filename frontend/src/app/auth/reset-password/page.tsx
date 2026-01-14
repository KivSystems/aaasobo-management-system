import styles from "./page.module.scss";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "@/app/components/elements/loading/Loading";
import ResetPasswordForm from "@/app/components/features/resetPasswordForm/ResetPasswordForm";
import { verifyResetToken } from "@/app/helper/api/usersApi";

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token: string; type: UserType }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const userType = searchParams.type;

  const tokenVerificationResult = await verifyResetToken(token, userType);

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
          <ResetPasswordForm
            token={token}
            userType={userType}
            tokenVerificationResult={tokenVerificationResult}
          />
        </Suspense>
      </div>
    </main>
  );
}

"use client";

import { verifyUserEmail } from "@/app/helper/api/usersApi";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "../../elements/loading/Loading";
import Link from "next/link";
import styles from "./EmailVerificationForm.module.scss";

export const EmailVerificationForm = () => {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userType = searchParams.get("type") as UserType;

  const onSubmit = useCallback(async () => {
    // Prevents multiple API requests if a message (success or error) is already set.
    if (message) return;

    if (!token) {
      setMessage({
        type: "error",
        text: "Token not found.",
      });
      return;
    }

    if (!userType) {
      setMessage({
        type: "error",
        text: "User type not found.",
      });
      return;
    }

    const data = await verifyUserEmail(token, userType);

    if (data.error) {
      setMessage({ type: "error", text: data.error });
    } else {
      setMessage({ type: "success", text: data.success! });
    }
  }, [token, userType, message]);

  useEffect(() => {
    if (!message) {
      onSubmit();
    }
  }, [onSubmit, message]);

  return (
    <div className={styles.verificationForm}>
      {!message ? (
        <div className={styles.verificationForm__loaderWrapper}>
          <Loading />
        </div>
      ) : (
        <>
          {message?.type === "success" && <p>{message.text}</p>}
          {message?.type === "error" && (
            <p style={{ color: "red" }}>{message.text}</p>
          )}
          <Link
            className={styles.verificationForm__loginLink}
            href={
              userType === "customer"
                ? "/customers/login"
                : "/instructors/login"
            }
          >
            Login here
          </Link>
        </>
      )}
    </div>
  );
};

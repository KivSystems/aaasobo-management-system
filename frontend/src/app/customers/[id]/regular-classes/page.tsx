"use client";

import RegularClasses from "@/components/customers-dashboard/regular-classes/RegularClasses";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./page.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Page() {
  const params = useParams<{ id: string }>();
  const customerId = parseInt(params.id ?? "");
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const toastDisplayed = useRef(false); // Track whether toast was shown

  useEffect(() => {
    if (toastDisplayed.current) return; // Prevent duplicate toasts

    if (!paramsKey) return;

    const urlParams = new URLSearchParams(paramsKey);
    const successMessage = urlParams.get("successMessage");
    if (successMessage) {
      toast.success(successMessage);
    }

    const warningMessage = urlParams.get("warningMessage");
    if (warningMessage) {
      toast.warning(warningMessage);
    }

    if (!successMessage && !warningMessage) return;

    toastDisplayed.current = true; // Mark toast as displayed
    // Clean up the URL only when toast params exist.
    router.replace(window.location.pathname);
  }, [paramsKey, router]);

  return (
    <div>
      <div className={styles.header}>Regular Classes</div>
      <RegularClasses customerId={customerId} />
    </div>
  );
}

export default Page;

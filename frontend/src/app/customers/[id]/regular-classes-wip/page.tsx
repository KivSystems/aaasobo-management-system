"use client";

import RegularClassesWip from "@/app/components/customers-dashboard/regular-classes/RegularClassesWip";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./page.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Page({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id);
  if (isNaN(customerId)) {
    throw new Error("Invalid customerId");
  }
  const searchParams = useSearchParams();
  const toastDisplayed = useRef(false);

  useEffect(() => {
    if (toastDisplayed.current) return;

    const successMessage = searchParams.get("successMessage");
    if (successMessage) {
      toast.success(successMessage);
      toastDisplayed.current = true;
    }

    const warningMessage = searchParams.get("warningMessage");
    if (warningMessage) {
      toast.warning(warningMessage);
      toastDisplayed.current = true;
    }

    const urlWithoutMessage = window.location.pathname;
    window.history.replaceState({}, document.title, urlWithoutMessage);
  }, [searchParams]);

  return (
    <div>
      <div className={styles.header}>
        Regular Classes (WIP - New Schedule System)
      </div>
      <RegularClassesWip customerId={customerId} />
    </div>
  );
}

export default Page;

"use client";

import ErrorPage from "@/app/components/elements/erroPage/ErrorPage";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // TODO: Using context, decide which language to use to display error messages
  const [messageJp, messageEn] = error.message.split(" / ");
  const errorMessages = { messageJp, messageEn };

  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPage reset={reset} errorMessages={errorMessages} lng="jp" />;
}

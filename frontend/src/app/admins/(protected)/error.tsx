"use client";

import ErrorPage from "@/components/elements/errorPage/ErrorPage";
import { ERROR_PAGE_MESSAGE_JP } from "@/lib/messages/generalMessages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [messageEn, messageJa] = error.message.split(" / ");
  const httpStatus = messageEn.match(/^HTTP error! status: (\d{3})$/)?.[1];
  const errorMessages = {
    messageEn,
    messageJa:
      messageJa ||
      (httpStatus
        ? `データの取得に失敗しました（HTTP ${httpStatus}）。`
        : ERROR_PAGE_MESSAGE_JP),
  };

  return (
    <ErrorPage reset={reset} errorMessages={errorMessages} language="ja" />
  );
}

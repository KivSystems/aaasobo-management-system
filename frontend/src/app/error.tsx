"use client";

import ErrorPage from "@/app/components/elements/erroPage/ErrorPage";
import { useLanguage } from "@/app/contexts/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  const [messageEn, messageJa] = error.message.split(" / ");
  const errorMessages = { messageEn, messageJa: messageJa || messageEn };

  return (
    <ErrorPage reset={reset} errorMessages={errorMessages} lng={language} />
  );
}

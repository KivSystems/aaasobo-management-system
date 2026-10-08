import { LanguageProvider } from "@/contexts/LanguageContext";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return (
    <LanguageProvider
      fixedLanguage={
        type === "admin" ? "ja" : type === "instructor" ? "en" : undefined
      }
    >
      <ForgotPasswordPageClient />
    </LanguageProvider>
  );
}

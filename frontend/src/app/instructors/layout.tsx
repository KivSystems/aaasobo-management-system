import { LanguageProvider } from "@/contexts/LanguageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider fixedLanguage="en">
      <div lang="en" style={{ display: "contents" }}>
        {children}
      </div>
    </LanguageProvider>
  );
}

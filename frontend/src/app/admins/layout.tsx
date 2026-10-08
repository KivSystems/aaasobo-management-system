import { LanguageProvider } from "@/contexts/LanguageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider fixedLanguage="ja">
      <div lang="ja" style={{ display: "contents" }}>
        {children}
      </div>
    </LanguageProvider>
  );
}

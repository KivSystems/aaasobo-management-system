import { useLanguage } from "@/app/contexts/LanguageContext";
import styles from "./BookableClassesInfo.module.scss";

export function BookableClassesInfo({
  bookableClasses,
  onClick,
}: {
  bookableClasses: string[] | null;
  onClick: () => void;
}) {
  const { language } = useLanguage();

  return (
    <p
      onClick={() => bookableClasses && bookableClasses.length > 0 && onClick()}
      className={`${styles.bookableClasses} ${
        bookableClasses && bookableClasses.length > 0 ? styles.clickable : ""
      }`}
    >
      {language === "ja" ? "振替可能クラス" : "Bookable Classes"}:{" "}
      {bookableClasses?.length ?? 0}
    </p>
  );
}

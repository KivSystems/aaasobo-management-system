import styles from "./BookableClassesInfo.module.scss";

type BookableClassesInfoProps = {
  bookableClasses: string[] | null;
  onClick: () => void;
};

export function BookableClassesInfo({
  bookableClasses,
  onClick,
}: BookableClassesInfoProps) {
  return (
    <p
      onClick={() => bookableClasses && bookableClasses.length > 0 && onClick()}
      className={`${styles.bookableClasses} ${
        bookableClasses && bookableClasses.length > 0 ? styles.clickable : ""
      }`}
    >
      Bookable Classes: {bookableClasses?.length ?? 0}
    </p>
  );
}

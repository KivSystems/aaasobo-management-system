import styles from "./ClassInstructor.module.scss";
import Image from "next/image";

const ClassInstructor = ({
  classStatus,
  instructorIcon,
  instructorNickname,
  className,
  width = 135,
}: {
  classStatus: string;
  instructorIcon: string;
  instructorNickname: string;
  className?: string;
  width?: number;
}) => {
  return (
    <div className={`${styles.instructor} ${className && styles[className]}`}>
      <Image
        src={`${instructorIcon}?t=${Date.now()}`}
        alt={instructorNickname}
        width={width}
        height={width}
        priority
        unoptimized
        className={`${styles.instructor__icon} ${styles[classStatus]}`}
      />
      <div className={styles.instructor__name}>{instructorNickname}</div>
    </div>
  );
};

export default ClassInstructor;

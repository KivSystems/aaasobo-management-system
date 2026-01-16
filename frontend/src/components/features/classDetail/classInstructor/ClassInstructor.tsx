import styles from "./ClassInstructor.module.scss";
import Image from "next/image";
import { useId } from "react";

const ClassInstructor = ({
  classStatus,
  instructorIcon,
  instructorNickname,
  className,
  width = 135,
  onClick,
}: {
  classStatus: string;
  instructorIcon: string;
  instructorNickname: string;
  className?: string;
  width?: number;
  onClick?: () => void;
}) => {
  const cacheBust = useId();
  return (
    <div className={`${styles.instructor} ${className && styles[className]}`}>
      <Image
        src={`${instructorIcon}?t=${cacheBust}`}
        alt={instructorNickname}
        width={width}
        height={width}
        priority
        unoptimized
        className={`${styles.instructor__icon} ${styles[classStatus]}`}
        onClick={onClick}
      />
      <div className={styles.instructor__name}>{instructorNickname}</div>
    </div>
  );
};

export default ClassInstructor;

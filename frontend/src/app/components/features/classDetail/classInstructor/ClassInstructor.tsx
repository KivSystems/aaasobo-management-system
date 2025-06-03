import styles from "./ClassInstructor.module.scss";
import Image from "next/image";

const ClassInstructor = ({
  classStatus,
  instructorIcon,
  instructorNickname,
}: {
  classStatus: string;
  instructorIcon: string;
  instructorNickname: string;
}) => {
  return (
    <div className={styles.instructor}>
      <Image
        src={`/instructors/${instructorIcon}`}
        alt={instructorNickname}
        width={135}
        height={135}
        priority
        className={`${styles.instructor__icon} ${styles[classStatus]}`}
      />
      <div className={styles.instructor__name}>{instructorNickname}</div>
    </div>
  );
};

export default ClassInstructor;

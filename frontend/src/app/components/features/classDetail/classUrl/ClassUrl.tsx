import { hasTimePassed } from "@/app/helper/utils/dateUtils";
import styles from "./ClassUrl.module.scss";
import { VideoCameraIcon } from "@heroicons/react/24/solid";

const ClassUrl = ({
  classStatus,
  classEnd,
  classUrl,
  meetingId,
  passCode,
  language,
}: {
  classStatus: ClassStatus;
  classEnd: string;
  classUrl: string;
  meetingId: string;
  passCode: string;
  language?: LanguageType;
}) => {
  // Only render if the class status is "booked" or "rebooked", and the class has not ended yet.
  const showUrl =
    (classStatus === "booked" || classStatus === "rebooked") &&
    !hasTimePassed(classEnd);

  if (!showUrl) return null;

  return (
    <div className={styles.classURL}>
      <div className={styles.classURL__iconContainer}>
        <VideoCameraIcon className={styles.classURL__icon} />
      </div>
      <div className={styles.classURL__details}>
        <div className={styles.classURL__url}>
          <a href={classUrl} target="_blank" rel="noopener noreferrer">
            {classUrl}
          </a>
        </div>
        <div className={styles.classURL__password}>
          {language === "ja" ? "ミーティング" : "Meeting"} ID : {meetingId}
        </div>
        <div className={styles.classURL__password}>
          {language === "ja" ? "パスコード" : "Passcode"} : {passCode}
        </div>
      </div>
    </div>
  );
};

export default ClassUrl;

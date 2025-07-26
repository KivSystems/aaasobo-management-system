import {
  formatClassDetailFooter,
  getEndTime,
  hasTimePassed,
} from "@/app/helper/utils/dateUtils";
import styles from "./ClassDetailsCard.module.scss";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import ClassStatus from "@/app/components/features/classDetail/classStatus/ClassStatus";
import ClassDateTime from "@/app/components/features/classDetail/classDateTime/ClassDateTime";
import ClassUrl from "@/app/components/features/classDetail/classUrl/ClassUrl";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import ChildDetailsCard from "../childDetailsCard/ChildDetailsCard";

const ClassDetailsCard = ({
  classDetails,
}: {
  classDetails: InstructorClassDetail | null;
}) => {
  if (!classDetails) {
    return <div>No class details available</div>;
  }

  const isFreeTrial =
    classDetails.isFreeTrial &&
    (classDetails.status === "booked" || classDetails.status === "rebooked");

  const bookedStatuses: ClassStatus[] = ["booked", "rebooked"];

  const classDateTime = new Date(classDetails.dateTime);
  const classEndTime = getEndTime(classDateTime).toISOString();

  return (
    <div
      className={`${styles.classCard} ${isFreeTrial ? styles.freeTrial : styles[classDetails.status]}`}
    >
      <ClassStatus status={classDetails.status} isFreeTrial={isFreeTrial} />

      <ClassDateTime classStart={classDetails.dateTime} />

      {bookedStatuses.includes(classDetails.status) && (
        <ClassUrl
          classEnd={classEndTime}
          classStatus={classDetails.status}
          classUrl={classDetails.classURL}
          meetingId={classDetails.meetingId}
          passCode={classDetails.passcode}
        />
      )}

      {bookedStatuses.includes(classDetails.status) &&
        !hasTimePassed(classEndTime) && (
          <InfoBanner info="If you need to cancel a class, please contact our staff promptly via Facebook." />
        )}

      <div className={styles.children}>
        <div className={styles.children__title}>
          {classDetails.status === "canceledByInstructor"
            ? "Children"
            : !hasTimePassed(classEndTime)
              ? "Attending Children"
              : "Attended Children"}
        </div>

        {classDetails.status !== "canceledByInstructor" &&
        classDetails.attendingChildren.length === 0 ? (
          <div className={styles.children__header}>
            <div className={styles.children__iconContainer}>
              <UserIconOutline className={styles.children__icon} />
            </div>
            <div className={styles.children__nameContainer}>
              <div className={styles.children__nameTitle}>
                The registered children were absent.
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.children__contentContainer}>
            {classDetails.status === "canceledByInstructor"
              ? classDetails.customerChildren.map((child) => (
                  <ChildDetailsCard key={child.id} child={child} />
                ))
              : classDetails.attendingChildren.map((child) => (
                  <ChildDetailsCard key={child.id} child={child} />
                ))}
          </div>
        )}

        <div className={styles.footer}>
          <span>{`Class Code: ${classDetails.classCode}`}</span>
          <span>{formatClassDetailFooter(classDetails.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsCard;

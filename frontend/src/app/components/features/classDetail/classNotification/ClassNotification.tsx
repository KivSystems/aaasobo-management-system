import {
  formatYearDateTime,
  hasTimePassed,
  isPastPreviousDayDeadline,
} from "@/app/helper/utils/dateUtils";
import styles from "./ClassNotification.module.scss";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import {
  CANCELED_BY_CUSTOMER_NOTICE,
  CANCELED_BY_INSTRUCTOR_NOTICE,
  SAME_DAY_CANCELATION_NOTICE,
} from "@/app/helper/messages/customerDashboard";

const ClassNotification = ({
  classStatus,
  classStart,
  classEnd,
  rebookableUntil,
  language,
}: {
  classStatus: ClassStatus;
  classStart: string;
  classEnd: string;
  rebookableUntil: string;
  language: LanguageType;
}) => {
  if (
    classStatus === "completed" ||
    ((classStatus === "booked" || classStatus === "rebooked") &&
      hasTimePassed(classStart))
  )
    return null;

  const PriorDayCancellationNotice = () => {
    return language === "ja" ? (
      <p>
        キャンセルが前日まで（日本時間基準）に行われた場合、{" "}
        <span>{formatYearDateTime(new Date(rebookableUntil), "ja-JP")}</span>
        のクラスまで振替できます。
      </p>
    ) : (
      <p>
        If the cancellation is made by the day before (based on Japan time), you
        can rebook up to the class on{" "}
        <span>{formatYearDateTime(new Date(rebookableUntil))}</span>.
      </p>
    );
  };

  const SameDayCancellationNotice = () => {
    return <p>{SAME_DAY_CANCELATION_NOTICE[language]}</p>;
  };

  const CanceledByInstructorNotice = () => {
    return <p>{CANCELED_BY_INSTRUCTOR_NOTICE[language]}</p>;
  };

  const CanceledByCustomerNotice = () => {
    return <p>{CANCELED_BY_CUSTOMER_NOTICE[language]}</p>;
  };

  return (
    <div className={styles.notification}>
      <div className={styles.notification__iconContainer}>
        <InformationCircleIcon className={styles.notification__icon} />
      </div>
      {/* condition 1: class status: "booked" or "rebooked", current date&time: before the day of the class */}
      {(classStatus === "booked" || classStatus === "rebooked") &&
        !isPastPreviousDayDeadline(classStart) && (
          <PriorDayCancellationNotice />
        )}

      {/* condition 2: class status: "booked" or "rebooked", current date&time: on the same day of the class and before the end of the class */}
      {(classStatus === "booked" || classStatus === "rebooked") &&
        isPastPreviousDayDeadline(classStart) &&
        !hasTimePassed(classEnd) && <SameDayCancellationNotice />}

      {/* condition 3: class status: "canceledByInstructor" */}
      {classStatus === "canceledByInstructor" && <CanceledByInstructorNotice />}

      {/* condition 4: class status: "canceledByCustomer" */}
      {classStatus === "canceledByCustomer" && <CanceledByCustomerNotice />}
    </div>
  );
};

export default ClassNotification;

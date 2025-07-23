"use client";

import { useState } from "react";
import { formatShortDate } from "@/app/helper/utils/dateUtils";
import ClassDetailsCard from "@/app/components/instructors-dashboard/class-schedule/classDetails/classDetailsCard/ClassDetailsCard";
import styles from "./ClassDetails.module.scss";
import Breadcrumb from "../../../elements/breadcrumb/Breadcrumb";
import ClassItem from "./classItem/ClassItem";
import ClassItemForAdmin from "./classItem/ClassItemForAdmin";

function ClassDetails({
  instructorId,
  classId,
  classDetails,
  classes,
  adminId,
  isAdminAuthenticated,
}: ClassDetailsProps) {
  const [isUpdatingData, setIsUpdatingData] = useState<boolean>(false);

  const firstClassDateTime = new Date(classes[0].dateTime);
  const classesDate = formatShortDate(
    firstClassDateTime,
    "en-US",
    "Asia/Tokyo",
  );

  // Set the active tab to the instructor calendar tab.
  if (isAdminAuthenticated) localStorage.setItem("activeInstructorTab", "0");

  const breadcrumbHref = isAdminAuthenticated
    ? `/admins/${adminId}/instructor-list/${instructorId}`
    : `/instructors/${instructorId}/class-schedule`;

  return (
    <div className={styles.classDetails}>
      <Breadcrumb
        links={[
          { href: breadcrumbHref, label: "Class Schedule" },
          { label: "Class Details" },
        ]}
      />

      <main className={styles.classDetails__container}>
        <div className={styles.classItems}>
          <h3 className={styles.classItems__title}>
            Classes on <span>{classesDate}</span> <span>(JP time)</span>
          </h3>
          <ul className={styles.classItems__list}>
            {classes.length > 0 ? (
              classes.map((classItem) =>
                isAdminAuthenticated && adminId ? (
                  <ClassItemForAdmin
                    key={classItem.id}
                    adminId={adminId}
                    instructorId={instructorId}
                    classItem={classItem}
                    classId={classId}
                    isUpdatingData={isUpdatingData}
                    setIsUpdatingData={setIsUpdatingData}
                    isAdminAuthenticated={isAdminAuthenticated}
                  />
                ) : (
                  <ClassItem
                    key={classItem.id}
                    classItem={classItem}
                    classId={classId}
                    instructorId={instructorId}
                    isUpdatingData={isUpdatingData}
                    setIsUpdatingData={setIsUpdatingData}
                  />
                ),
              )
            ) : (
              <p className={styles.classItems__noClasses}>No classes.</p>
            )}
          </ul>
        </div>

        <div className={styles.detailsCard}>
          <h3 className={styles.detailsCard__title}>Class Details</h3>
          <ClassDetailsCard classDetails={classDetails} />
        </div>
      </main>
    </div>
  );
}

export default ClassDetails;

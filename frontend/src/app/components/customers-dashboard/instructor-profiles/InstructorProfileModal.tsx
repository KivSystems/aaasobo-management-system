"use client";

import styles from "./InstructorProfileModal.module.scss";
import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";

const InstructorProfileModal = ({
  instructor,
  userSessionType,
  width = "100%",
}: {
  instructor: InstructorProfile;
  userSessionType: UserType;
  width?: string;
}) => {
  return (
    <div className={styles.modalContent} style={{ width }}>
      <InstructorProfile
        instructor={instructor}
        userSessionType={userSessionType}
      />
    </div>
  );
};

export default InstructorProfileModal;

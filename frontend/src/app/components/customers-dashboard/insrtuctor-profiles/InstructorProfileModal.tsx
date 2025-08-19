"use client";

import styles from "./InstructorProfileModal.module.scss";
import InstructorProfile from "@/app/components/instructors-dashboard/instructor-profile/InstructorProfile";

const InstructorProfileModal = ({
  instructor,
  width = "100%",
}: {
  instructor: InstructorProfile;
  width?: string;
}) => {
  return (
    <div className={styles.modalContent} style={{ width }}>
      <InstructorProfile instructor={instructor} />
    </div>
  );
};

export default InstructorProfileModal;

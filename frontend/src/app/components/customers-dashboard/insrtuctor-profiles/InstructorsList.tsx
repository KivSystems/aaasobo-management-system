"use client";

import styles from "./InstructorsList.module.scss";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Modal from "@/app/components/elements/modal/Modal";
import ClassInstructor from "@/app/components/features/classDetail/classInstructor/ClassInstructor";
import InstructorProfileModal from "@/app/components/customers-dashboard/insrtuctor-profiles/InstructorProfileModal";

export default function InstructorsList({
  instructorProfiles,
}: {
  instructorProfiles: InstructorProfile[];
}) {
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorProfile | null>(null);
  const { language } = useLanguage(); // TODO: Implement language-specific features

  return (
    <div className={styles.instructors__list}>
      {instructorProfiles.map((instructor) => (
        <ClassInstructor
          key={instructor.id}
          classStatus="none"
          instructorIcon={instructor.icon.url}
          instructorNickname={instructor.nickname}
          width={140}
          className="instructorCursorItem"
          onClick={() => setSelectedInstructor(instructor)}
        />
      ))}

      {selectedInstructor && (
        <Modal
          isOpen={!!selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
        >
          <InstructorProfileModal instructor={selectedInstructor} />
        </Modal>
      )}
    </div>
  );
}

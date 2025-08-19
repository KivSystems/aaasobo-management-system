"use client";

import styles from "./InstructorsList.module.scss";
import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Modal from "@/app/components/elements/modal/Modal";
import InputField from "@/app/components/elements/inputField/InputField";
import ClassInstructor from "@/app/components/features/classDetail/classInstructor/ClassInstructor";
import InstructorProfileModal from "@/app/components/customers-dashboard/insrtuctor-profiles/InstructorProfileModal";

export default function InstructorsList({
  instructorProfiles,
  userSessionType,
}: {
  instructorProfiles: InstructorProfile[];
  userSessionType: UserType;
}) {
  const [filteredInstructors, setFilteredInstructors] = useState<
    InstructorProfile[] | null
  >(instructorProfiles);
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorProfile | null>(null);
  const { language } = useLanguage();

  return (
    <>
      <InputField
        type="text"
        placeholder={
          language === "en"
            ? "Search instructors..."
            : "インストラクター検索..."
        }
        onChange={(e) => {
          const query = e.target.value.toLowerCase();
          setFilteredInstructors(
            instructorProfiles.filter((instructor) =>
              instructor.nickname.toLowerCase().includes(query),
            ),
          );
        }}
        className={styles.instructorSearch}
      />
      <div className={styles.instructors__list}>
        {filteredInstructors?.map((instructor) => (
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
            <InstructorProfileModal
              instructor={selectedInstructor}
              userSessionType={userSessionType}
            />
          </Modal>
        )}
      </div>
    </>
  );
}

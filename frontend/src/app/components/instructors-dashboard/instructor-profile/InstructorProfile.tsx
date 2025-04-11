"use client";

import Image from "next/image";
import styles from "./InstructorProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateUser } from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  EnvelopeIcon,
  InformationCircleIcon,
  LinkIcon,
  UserCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../elements/loading/Loading";

function InstructorProfile({
  instructor,
  isAdminAuthenticated,
}: {
  instructor: Instructor | null;
  isAdminAuthenticated?: boolean;
}) {
  const [updateResultState, formAction] = useFormState(updateUser, {});
  const [previousInstructor, setPreviousInstructor] =
    useState<Instructor | null>(instructor);
  const [latestInstructor, setLatestInstructor] = useState<Instructor | null>(
    instructor,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Instructor,
  ) => {
    if (latestInstructor) {
      setLatestInstructor({ ...latestInstructor, [field]: e.target.value });
    }
  };

  const handleCancelClick = () => {
    if (latestInstructor) {
      setLatestInstructor(previousInstructor);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("instructor" in updateResultState) {
        const result = updateResultState as { instructor: Instructor };
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setPreviousInstructor(result.instructor);
        setLatestInstructor(result.instructor);
      } else {
        const result = updateResultState as { errorMessage: string };
        toast.error(result.errorMessage);
      }
    }
  }, [updateResultState]);

  return (
    <>
      <h2>Profile Page</h2>
      <div className={styles.container}>
        {latestInstructor ? (
          <form action={formAction} className={styles.profileCard}>
            <Image
              src={`/instructors/${latestInstructor.icon}`}
              alt={latestInstructor.name}
              width={100}
              height={100}
              priority
              className={styles.pic}
            />

            {/* Instructor name */}
            <div className={styles.instructorName__nameSection}>
              <p className={styles.instructorName__text}>Name</p>
              {isEditing ? (
                <InputField
                  name="name"
                  value={latestInstructor.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className={`${styles.instructorName__inputField} ${isEditing ? styles.editable : ""}`}
                />
              ) : (
                <h3 className={styles.instructorName__name}>
                  {latestInstructor.name}
                </h3>
              )}
            </div>

            {/* Instructor nickname */}
            <div className={styles.insideContainer}>
              <UserCircleIcon className={styles.icon} />
              <div>
                <p>Nickname</p>
                {isEditing ? (
                  <InputField
                    name="nickname"
                    value={latestInstructor.nickname}
                    onChange={(e) => handleInputChange(e, "nickname")}
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>{latestInstructor.nickname}</h4>
                )}
              </div>
            </div>

            {/* Instructor email */}
            <div className={styles.insideContainer}>
              <EnvelopeIcon className={styles.icon} />
              <div>
                <p>Email</p>
                {isEditing ? (
                  <InputField
                    name="email"
                    type="email"
                    value={latestInstructor.email}
                    onChange={(e) => handleInputChange(e, "email")}
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>{latestInstructor.email}</h4>
                )}
              </div>
            </div>

            {/* Instructor Class URL, Meeting ID, and Passcode */}
            <div className={styles.insideContainer}>
              <VideoCameraIcon className={styles.icon} />
              <div>
                <p>Class URL</p>
                {isEditing ? (
                  <InputField
                    name="classURL"
                    value={latestInstructor.classURL}
                    onChange={(e) => handleInputChange(e, "classURL")}
                    className={`${styles.classUrl__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>
                    <a
                      href={latestInstructor.classURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.url}
                    >
                      {latestInstructor.classURL}
                    </a>
                  </h4>
                )}

                <div className={styles.urlInfo}>
                  <p>Meeting ID&nbsp;:&nbsp;</p>
                  {isEditing ? (
                    <InputField
                      name="meetingId"
                      value={latestInstructor.meetingId}
                      onChange={(e) => handleInputChange(e, "meetingId")}
                      className={`${styles.meetingId__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <p>{latestInstructor.meetingId}</p>
                  )}
                </div>
                <div className={styles.urlInfo}>
                  <p>Passcode&nbsp;&nbsp;:&nbsp;</p>
                  {isEditing ? (
                    <InputField
                      name="passcode"
                      value={latestInstructor.passcode}
                      onChange={(e) => handleInputChange(e, "passcode")}
                      className={`${styles.passcode__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <p>{latestInstructor.passcode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructor introduction URL */}
            <div className={styles.insideContainer}>
              <LinkIcon className={styles.icon} />
              <div>
                <p>Self Introduction URL</p>
                {isEditing ? (
                  <InputField
                    name="introductionURL"
                    value={latestInstructor.introductionURL}
                    onChange={(e) => handleInputChange(e, "introductionURL")}
                    className={`${styles.selfIntroduction__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>
                    <a
                      href={latestInstructor.introductionURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.url}
                    >
                      {latestInstructor.introductionURL}
                    </a>
                  </h4>
                )}
              </div>
            </div>
            <div className={styles.insideContainer}>
              <InformationCircleIcon className={styles.icon} />
              <p className={styles.info}>
                If you wish to update the profile information above, please
                contact the staff via Facebook.
              </p>
            </div>

            {/* Hidden input fields */}
            <input type="hidden" name="userType" value="instructor" />
            <input type="hidden" name="id" value={latestInstructor.id} />
            <input type="hidden" name="icon" value={latestInstructor.icon} />

            {/* Action buttons for only admin */}
            {isAdminAuthenticated ? (
              <>
                {isEditing ? (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="cancelEditingInstructor"
                      btnText="Cancel"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelClick();
                      }}
                    />

                    <ActionButton
                      className="saveInstructor"
                      btnText="Save"
                      type="submit"
                      Icon={CheckIcon}
                    />
                  </div>
                ) : (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="editInstructor"
                      btnText="Edit"
                      onClick={handleEditClick}
                    />
                  </div>
                )}
              </>
            ) : null}
          </form>
        ) : latestInstructor === null ? (
          <p>Instructor not found.</p>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default InstructorProfile;

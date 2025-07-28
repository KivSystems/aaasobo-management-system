"use client";

import Image from "next/image";
import styles from "./InstructorProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateInstructorAction } from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  formatBirthdateToISO,
  getShortMonth,
} from "@/app/helper/utils/dateUtils";
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
  instructor: Instructor | string;
  isAdminAuthenticated?: boolean;
}) {
  const [updateResultState, formAction] = useFormState(
    updateInstructorAction,
    {},
  );
  const [previousInstructor, setPreviousInstructor] =
    useState<Instructor | null>(
      typeof instructor !== "string" ? instructor : null,
    );
  const [latestInstructor, setLatestInstructor] = useState<Instructor | null>(
    typeof instructor !== "string" ? instructor : null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
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

  if (typeof instructor === "string") {
    return <p>{instructor}</p>;
  }

  return (
    <>
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

            {/* Name*/}
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
                <>
                  <h3 className={styles.instructorName__name}>
                    {latestInstructor.name}
                  </h3>
                </>
              )}
            </div>

            {/* Nickname, Date of Birth, Life History, Favorite Food, Hobby, Message For Children, Skill */}
            <div className={styles.insideContainer}>
              <UserCircleIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <div>
                  <div>
                    <p>Nickname</p>
                    {isEditing ? (
                      <InputField
                        name="nickname"
                        value={latestInstructor.nickname}
                        onChange={(e) => handleInputChange(e, "nickname")}
                        className={`${styles.nickname__inputField} ${isEditing ? styles.editable : ""}`}
                      />
                    ) : (
                      <h4 className={styles.nickname__text}>
                        {latestInstructor.nickname}
                      </h4>
                    )}
                  </div>
                </div>
                <div>
                  <p>Date of Birth</p>
                  {isEditing ? (
                    <InputField
                      name="birthdate"
                      type="date"
                      value={formatBirthdateToISO(latestInstructor.birthdate)}
                      onChange={(e) => handleInputChange(e, "birthdate")}
                      className={`${styles.birthdate__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.birthdate__text}>
                      {getShortMonth(new Date(latestInstructor.birthdate))}{" "}
                      {new Date(latestInstructor.birthdate).getDate()}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Class</p>
                  {isEditing ? (
                    <textarea
                      id="workingTime"
                      name="workingTime"
                      defaultValue={latestInstructor.workingTime}
                      onChange={(e) => handleInputChange(e, "workingTime")}
                      className={`${styles.workingTime__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.workingTime__text}>
                      {latestInstructor.workingTime}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Life History</p>
                  {isEditing ? (
                    <textarea
                      id="lifeHistory"
                      name="lifeHistory"
                      defaultValue={latestInstructor.lifeHistory}
                      onChange={(e) => handleInputChange(e, "lifeHistory")}
                      className={`${styles.lifeHistory__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.lifeHistory__text}>
                      {latestInstructor.lifeHistory}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Favorite Food</p>
                  {isEditing ? (
                    <textarea
                      name="favoriteFood"
                      defaultValue={latestInstructor.favoriteFood}
                      onChange={(e) => handleInputChange(e, "favoriteFood")}
                      className={`${styles.favoriteFood__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.favoriteFood__text}>
                      {latestInstructor.favoriteFood}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Hobby</p>
                  {isEditing ? (
                    <textarea
                      name="hobby"
                      defaultValue={latestInstructor.hobby}
                      onChange={(e) => handleInputChange(e, "hobby")}
                      className={`${styles.hobby__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.hobby__text}>
                      {latestInstructor.hobby}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Message For Children</p>
                  {isEditing ? (
                    <textarea
                      name="messageForChildren"
                      defaultValue={latestInstructor.messageForChildren}
                      onChange={(e) =>
                        handleInputChange(e, "messageForChildren")
                      }
                      className={`${styles.messageForChildren__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.messageForChildren__text}>
                      {latestInstructor.messageForChildren}
                    </h4>
                  )}
                </div>
                <div>
                  <p>Skill</p>
                  {isEditing ? (
                    <textarea
                      name="skill"
                      defaultValue={latestInstructor.skill}
                      onChange={(e) => handleInputChange(e, "skill")}
                      className={`${styles.skill__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.skill__text}>
                      {latestInstructor.skill}
                    </h4>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
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
                  <h4 className={styles.email__text}>
                    {latestInstructor.email}
                  </h4>
                )}
              </div>
            </div>

            {/* Class URL, Meeting ID, and Passcode */}
            <div className={styles.insideContainer}>
              <VideoCameraIcon className={styles.icon} />
              <div>
                <p>Class URL</p>
                {isEditing ? (
                  <InputField
                    name="classURL"
                    type="url"
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
                    type="url"
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
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default InstructorProfile;

"use client";

import styles from "./InstructorProfile.module.scss";
import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { updateInstructorAction } from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  formatBirthdateToISO,
  getShortMonth,
} from "@/app/helper/utils/dateUtils";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  CakeIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  PencilSquareIcon,
  LightBulbIcon,
  FaceSmileIcon,
  HandThumbUpIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  LinkIcon,
  UserCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../elements/loading/Loading";
import Uploader from "../../features/registerForm/uploadImages/Uploader";
import { defaultUserImageUrl } from "@/app/helper/data/data";
import Image from "next/image";

function InstructorProfile({
  instructor,
  token,
  isAdminAuthenticated,
}: {
  instructor: Instructor | string;
  token: string;
  isAdminAuthenticated?: boolean;
}) {
  const [updateResultState, formAction] = useFormState(
    updateInstructorAction,
    {},
  );
  const { localMessages, clearErrorMessage } =
    useFormMessages(updateResultState);
  const [previousInstructor, setPreviousInstructor] =
    useState<Instructor | null>(
      typeof instructor !== "string" ? instructor : null,
    );
  const [latestInstructor, setLatestInstructor] = useState<Instructor | null>(
    typeof instructor !== "string" ? instructor : null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultUrl = defaultUserImageUrl;

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
      clearErrorMessage(field);
    }
  };

  const handleCancelClick = () => {
    if (latestInstructor) {
      setLatestInstructor(previousInstructor);
      setIsEditing(false);
      clearErrorMessage("all");
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("instructor" in updateResultState) {
        const result = updateResultState as { instructor: Instructor };
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        const newInstructor = result.instructor;
        if (
          typeof newInstructor.icon === "string" &&
          token !== "" &&
          (newInstructor.icon as string).includes(token)
        ) {
          newInstructor.icon = {
            url: `${newInstructor.icon}?t=${Date.now()}`,
          };
        } else {
          newInstructor.icon = {
            url: defaultUrl,
          };
        }
        setPreviousInstructor(newInstructor);
        setLatestInstructor(newInstructor);
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
              src={
                latestInstructor.icon.url === "default-user-icon"
                  ? defaultUrl
                  : latestInstructor.icon.url
              }
              alt={latestInstructor.name}
              width={100}
              height={100}
              unoptimized
              className={styles.pic}
            />

            {isEditing && (
              <>
                <input
                  type="file"
                  name="icon"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <Uploader
                  onFileSelect={(file) => {
                    if (fileInputRef.current && file) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      fileInputRef.current.files = dataTransfer.files;
                    }
                  }}
                  clearFileInputRef={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                />
              </>
            )}

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

            {/* Nickname Hobby, Message For Children, Skill */}
            <div className={styles.insideContainer}>
              <UserCircleIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Nickname</p>
                {isEditing ? (
                  <InputField
                    name="nickname"
                    value={latestInstructor.nickname}
                    onChange={(e) => handleInputChange(e, "nickname")}
                    error={localMessages.nickname}
                    className={`${styles.nickname__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4 className={styles.nickname__text}>
                    {latestInstructor.nickname}
                  </h4>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className={styles.insideContainer}>
              <CakeIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Birthday</p>
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
            </div>

            {/* Working Time */}
            <div className={styles.insideContainer}>
              <CalendarDaysIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Available Class</p>
                {isEditing ? (
                  <textarea
                    id="workingTime"
                    name="workingTime"
                    defaultValue={latestInstructor.workingTime}
                    onChange={(e) => handleInputChange(e, "workingTime")}
                    className={`${styles.workingTime__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.workingTime__text}>
                    {latestInstructor.workingTime}
                  </h4>
                )}
              </div>
            </div>

            {/* Life History */}
            <div className={styles.insideContainer}>
              <NewspaperIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Life History</p>
                {isEditing ? (
                  <textarea
                    id="lifeHistory"
                    name="lifeHistory"
                    defaultValue={latestInstructor.lifeHistory}
                    onChange={(e) => handleInputChange(e, "lifeHistory")}
                    className={`${styles.lifeHistory__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.lifeHistory__text}>
                    {latestInstructor.lifeHistory}
                  </h4>
                )}
              </div>
            </div>

            {/* Favorite Food */}
            <div className={styles.insideContainer}>
              <FaceSmileIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Favorite Food</p>
                {isEditing ? (
                  <textarea
                    name="favoriteFood"
                    defaultValue={latestInstructor.favoriteFood}
                    onChange={(e) => handleInputChange(e, "favoriteFood")}
                    className={`${styles.favoriteFood__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.favoriteFood__text}>
                    {latestInstructor.favoriteFood}
                  </h4>
                )}
              </div>
            </div>

            {/* Hobby */}
            <div className={styles.insideContainer}>
              <LightBulbIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Hobby</p>
                {isEditing ? (
                  <textarea
                    name="hobby"
                    defaultValue={latestInstructor.hobby}
                    onChange={(e) => handleInputChange(e, "hobby")}
                    className={`${styles.hobby__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.hobby__text}>
                    {latestInstructor.hobby}
                  </h4>
                )}
              </div>
            </div>

            {/* Message For Children */}
            <div className={styles.insideContainer}>
              <PencilSquareIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Message For Children</p>
                {isEditing ? (
                  <textarea
                    name="messageForChildren"
                    defaultValue={latestInstructor.messageForChildren}
                    onChange={(e) => handleInputChange(e, "messageForChildren")}
                    className={`${styles.messageForChildren__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.messageForChildren__text}>
                    {latestInstructor.messageForChildren}
                  </h4>
                )}
              </div>
            </div>

            {/* Skill */}
            <div className={styles.insideContainer}>
              <HandThumbUpIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Skill</p>
                {isEditing ? (
                  <textarea
                    name="skill"
                    defaultValue={latestInstructor.skill}
                    onChange={(e) => handleInputChange(e, "skill")}
                    className={`${styles.skill__inputField} ${isEditing ? styles.editable : ""}`}
                    maxLength={500}
                  />
                ) : (
                  <h4 className={styles.skill__text}>
                    {latestInstructor.skill}
                  </h4>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles.insideContainer}>
              <EnvelopeIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>Email</p>
                {isEditing ? (
                  <InputField
                    name="email"
                    type="email"
                    value={latestInstructor.email}
                    onChange={(e) => handleInputChange(e, "email")}
                    error={localMessages.email}
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
              <div className={styles.userInfo}>
                <p>Class URL</p>
                {isEditing ? (
                  <InputField
                    name="classURL"
                    type="url"
                    value={latestInstructor.classURL}
                    onChange={(e) => handleInputChange(e, "classURL")}
                    error={localMessages.classURL}
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
                      error={localMessages.meetingId}
                      className={`${styles.meetingId__inputField} ${isEditing ? styles.editable : ""}`}
                      display="flex"
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
                      error={localMessages.passcode}
                      className={`${styles.passcode__inputField} ${isEditing ? styles.editable : ""}`}
                      display="flex"
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
              <div className={styles.userInfo}>
                <p>Self Introduction URL</p>
                {isEditing ? (
                  <InputField
                    name="introductionURL"
                    type="url"
                    value={latestInstructor.introductionURL}
                    onChange={(e) => handleInputChange(e, "introductionURL")}
                    error={localMessages.introductionURL}
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
            <input
              type="hidden"
              name="icon"
              value={latestInstructor.icon.url}
            />

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

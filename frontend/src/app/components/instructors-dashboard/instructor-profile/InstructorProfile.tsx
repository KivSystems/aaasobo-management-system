"use client";

import styles from "./InstructorProfile.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFormState } from "react-dom";
import { updateInstructorAction } from "@/app/actions/updateUser";
import { useLanguage } from "@/app/contexts/LanguageContext";
import UserStatusSwitcher from "@/app/components/elements/UserStatusSwitcher/UserStatusSwitcher";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  formatBirthdateToISO,
  getLongMonth,
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

// Define the specific string fields that are editable in this component
type EditableInstructorFields =
  | "name"
  | "nickname"
  | "birthdate"
  | "workingTime"
  | "lifeHistory"
  | "favoriteFood"
  | "hobby"
  | "messageForChildren"
  | "skill"
  | "email"
  | "classURL"
  | "meetingId"
  | "passcode"
  | "introductionURL";

function InstructorProfile({
  instructor,
  token,
  userSessionType,
}: {
  instructor: Instructor | InstructorProfile | string;
  token?: string;
  userSessionType?: UserType;
}) {
  const [updateResultState, formAction] = useFormState(
    updateInstructorAction,
    {},
  );
  // Handle form messages manually for UpdateFormState
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (updateResultState) {
      const newMessages: Record<string, string> = {};
      if (updateResultState.name) newMessages.name = updateResultState.name;
      if (updateResultState.nickname)
        newMessages.nickname = updateResultState.nickname;
      if (updateResultState.email) newMessages.email = updateResultState.email;
      if (updateResultState.classURL)
        newMessages.classURL = updateResultState.classURL;
      if (updateResultState.meetingId)
        newMessages.meetingId = updateResultState.meetingId;
      if (updateResultState.passcode)
        newMessages.passcode = updateResultState.passcode;
      if (updateResultState.introductionURL)
        newMessages.introductionURL = updateResultState.introductionURL;
      if (updateResultState.errorMessage)
        newMessages.errorMessage = updateResultState.errorMessage;
      setLocalMessages(newMessages);
    }
  }, [updateResultState]);

  const clearErrorMessage = useCallback(
    (field: string | EditableInstructorFields) => {
      setLocalMessages((prev) => {
        if (field === "all") {
          return {};
        }
        const updatedMessages = { ...prev };
        delete updatedMessages[field];
        delete updatedMessages.errorMessage;
        return updatedMessages;
      });
    },
    [],
  );
  const [previousInstructor, setPreviousInstructor] = useState<
    Instructor | InstructorProfile | null
  >(typeof instructor !== "string" ? instructor : null);
  const [latestInstructor, setLatestInstructor] = useState<
    Instructor | InstructorProfile | null
  >(typeof instructor !== "string" ? instructor : null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmResult, setConfirmResult] = useState<boolean>(false);
  const [status, setStatus] = useState<UserStatus>("active");
  const [leavingDate, setLeavingDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    field: EditableInstructorFields,
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

  const submissionConfirm = () => {
    if (leavingDate && !leavingDate.includes("T") && status === "leaving") {
      const updatedDate = leavingDate.replace(/-/g, "/");
      setConfirmResult(
        window.confirm(
          `Please confirm if the leaving date "${updatedDate}" (Japan Time) is correct.`,
        ),
      );
    } else {
      setConfirmResult(true);
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("instructor" in updateResultState && updateResultState.instructor) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        const newInstructor = updateResultState.instructor;
        if (
          typeof newInstructor.icon === "string" &&
          token &&
          token !== "" &&
          (newInstructor.icon as string).includes(token)
        ) {
          newInstructor.icon = {
            url: `${newInstructor.icon}?t=${Date.now()}`,
          };
        } else {
          newInstructor.icon = {
            url: defaultUserImageUrl,
          };
        }
        setPreviousInstructor(newInstructor);
        setLatestInstructor(newInstructor);
      } else if ("skipProcessing" in updateResultState) {
        return;
      } else {
        const result = updateResultState as { errorMessage: string };
        toast.error(result.errorMessage);
      }
    }
  }, [updateResultState, token]);

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
                latestInstructor.icon.url === defaultUserImageUrl
                  ? defaultUserImageUrl
                  : latestInstructor.icon.url
              }
              alt={latestInstructor.name}
              width={150}
              height={150}
              priority
              unoptimized
              className={styles.pic}
            />

            {/* User Status Switcher */}
            <UserStatusSwitcher
              isEditing={isEditing}
              leavingDate={latestInstructor.terminationAt}
              onStatusChange={(newStatus, newDate) => {
                setStatus(newStatus);
                setLeavingDate(newDate);
              }}
            />

            {isEditing && (
              <>
                {/* Image Uploader */}
                <p className={styles.profileImage__text}>Profile Image</p>
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

            {/* Name */}
            <div className={styles.instructorName__nameSection}>
              <p className={styles.instructorName__text}>
                {language === "en" ? "Name" : "名前"}
              </p>
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
                <p>{language === "en" ? "Nickname" : "ニックネーム"}</p>
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
                <p>{language === "en" ? "Birthday" : "お誕生日"}</p>
                {isEditing ? (
                  <InputField
                    name="birthdate"
                    type="date"
                    value={formatBirthdateToISO(
                      latestInstructor.birthdate || undefined,
                    )}
                    onChange={(e) => handleInputChange(e, "birthdate")}
                    onKeyDown={(e) => e.preventDefault()} // Prevent date input from typing
                    className={`${styles.birthdate__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4 className={styles.birthdate__text}>
                    {latestInstructor.birthdate ? (
                      <>
                        {getLongMonth(new Date(latestInstructor.birthdate))}{" "}
                        {new Date(latestInstructor.birthdate).getDate()}
                      </>
                    ) : (
                      "Not specified"
                    )}
                  </h4>
                )}
              </div>
            </div>

            {/* Working Time */}
            <div className={styles.insideContainer}>
              <CalendarDaysIcon className={styles.icon} />
              <div className={styles.userInfo}>
                <p>{language === "en" ? "Available Class" : "開講クラス"}</p>
                {isEditing ? (
                  <textarea
                    id="workingTime"
                    name="workingTime"
                    defaultValue={latestInstructor.workingTime || undefined}
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
                <p>{language === "en" ? "Life History" : "経歴"}</p>
                {isEditing ? (
                  <textarea
                    id="lifeHistory"
                    name="lifeHistory"
                    defaultValue={latestInstructor.lifeHistory || undefined}
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
                <p>{language === "en" ? "Favorite Food" : "好きな食べ物"}</p>
                {isEditing ? (
                  <textarea
                    name="favoriteFood"
                    defaultValue={latestInstructor.favoriteFood || undefined}
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
                <p>{language === "en" ? "Hobby" : "趣味"}</p>
                {isEditing ? (
                  <textarea
                    name="hobby"
                    defaultValue={latestInstructor.hobby || undefined}
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
                <p>
                  {language === "en"
                    ? "Message For Children"
                    : "子どもたちへメッセージ"}
                </p>
                {isEditing ? (
                  <textarea
                    name="messageForChildren"
                    defaultValue={
                      latestInstructor.messageForChildren || undefined
                    }
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
                <p>{language === "en" ? "Skill" : "スキル"}</p>
                {isEditing ? (
                  <textarea
                    name="skill"
                    defaultValue={latestInstructor.skill || undefined}
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
            {userSessionType !== "customer" && (
              <div className={styles.insideContainer}>
                <EnvelopeIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p>Email</p>
                  {isEditing ? (
                    <InputField
                      name="email"
                      type="email"
                      value={
                        "email" in latestInstructor
                          ? latestInstructor.email
                          : ""
                      }
                      onChange={(e) => handleInputChange(e, "email")}
                      error={localMessages.email}
                      className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.email__text}>
                      {"email" in latestInstructor
                        ? latestInstructor.email
                        : "Not available"}
                    </h4>
                  )}
                </div>
              </div>
            )}

            {/* Class URL, Meeting ID, and Passcode */}
            {userSessionType !== "customer" && (
              <div className={styles.insideContainer}>
                <VideoCameraIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p>Class URL</p>
                  {isEditing ? (
                    <InputField
                      name="classURL"
                      type="url"
                      value={
                        "classURL" in latestInstructor
                          ? latestInstructor.classURL || ""
                          : ""
                      }
                      onChange={(e) => handleInputChange(e, "classURL")}
                      error={localMessages.classURL}
                      className={`${styles.classUrl__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4>
                      <a
                        href={
                          "classURL" in latestInstructor
                            ? latestInstructor.classURL || undefined
                            : undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.url}
                      >
                        {"classURL" in latestInstructor
                          ? latestInstructor.classURL || "Not set"
                          : "Not available"}
                      </a>
                    </h4>
                  )}

                  <div className={styles.urlInfo}>
                    <p>Meeting ID&nbsp;:&nbsp;</p>
                    {isEditing ? (
                      <InputField
                        name="meetingId"
                        value={
                          "meetingId" in latestInstructor
                            ? latestInstructor.meetingId || ""
                            : ""
                        }
                        onChange={(e) => handleInputChange(e, "meetingId")}
                        error={localMessages.meetingId}
                        className={`${styles.meetingId__inputField} ${isEditing ? styles.editable : ""}`}
                        display="flex"
                      />
                    ) : (
                      <p>
                        {"meetingId" in latestInstructor
                          ? latestInstructor.meetingId || "Not set"
                          : "Not available"}
                      </p>
                    )}
                  </div>
                  <div className={styles.urlInfo}>
                    <p>Passcode&nbsp;&nbsp;:&nbsp;</p>
                    {isEditing ? (
                      <InputField
                        name="passcode"
                        value={
                          "passcode" in latestInstructor
                            ? latestInstructor.passcode || ""
                            : ""
                        }
                        onChange={(e) => handleInputChange(e, "passcode")}
                        error={localMessages.passcode}
                        className={`${styles.passcode__inputField} ${isEditing ? styles.editable : ""}`}
                        display="flex"
                      />
                    ) : (
                      <p>
                        {"passcode" in latestInstructor
                          ? latestInstructor.passcode || "Not set"
                          : "Not available"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructor introduction URL */}
            {/* TODO: Remove this section in a future version */}
            {userSessionType === "admin" && (
              <div className={styles.insideContainer}>
                <LinkIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p>Self Introduction URL</p>
                  {isEditing ? (
                    <InputField
                      name="introductionURL"
                      type="url"
                      value={
                        "introductionURL" in latestInstructor
                          ? latestInstructor.introductionURL || ""
                          : ""
                      }
                      onChange={(e) => handleInputChange(e, "introductionURL")}
                      error={localMessages.introductionURL}
                      className={`${styles.selfIntroduction__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4>
                      <a
                        href={
                          "introductionURL" in latestInstructor
                            ? latestInstructor.introductionURL || undefined
                            : undefined
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.url}
                      >
                        {"introductionURL" in latestInstructor
                          ? latestInstructor.introductionURL || "Not set"
                          : "Not available"}
                      </a>
                    </h4>
                  )}
                </div>
              </div>
            )}

            {/* Instructor introduction URL */}
            {userSessionType !== "customer" && (
              <div className={styles.insideContainer}>
                <InformationCircleIcon className={styles.icon} />
                <p className={styles.info}>
                  If you wish to update the profile information above, please
                  contact the staff via Facebook.
                </p>
              </div>
            )}

            {/* Hidden input fields */}
            <input type="hidden" name="id" value={latestInstructor.id} />
            <input
              type="hidden"
              name="icon"
              value={latestInstructor.icon.url}
            />
            <input
              type="hidden"
              name="confirmResult"
              value={confirmResult.toString()}
            />

            {/* Action buttons for only admin */}
            {userSessionType === "admin" ? (
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
                      onClick={submissionConfirm}
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

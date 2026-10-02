"use client";

import { localizeAdminMessage } from "@/lib/messages/adminMessages";
import styles from "./InstructorProfile.module.scss";
import { useState, useRef, useCallback } from "react";
import { updateInstructorAction } from "@/app/actions/updateUser";
import { useLanguage } from "@/contexts/LanguageContext";
import StatusSwitcher from "@/components/elements/StatusSwitcher/StatusSwitcher";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  formatBirthdateMonthDay,
  formatBirthdateToISO,
} from "@/lib/utils/dateUtils";
import {
  CakeIcon,
  CheckIcon,
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
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../elements/loading/Loading";
import { MASKED_HEAD_LETTERS, MASKED_BIRTHDATE } from "@/lib/data/data";
import Uploader from "../../features/registerForm/uploadImages/Uploader";
import { defaultUserImageUrl } from "@/lib/data/data";
import Image from "next/image";
import { confirmAlert } from "@/lib/utils/alertUtils";
import InstructorFeeRates from "./InstructorFeeRates";
import { EnglishBackground } from "@/types";
import RadioButton from "../../elements/radioButton/RadioButton";
import TextAreaInput from "../../elements/textAreaInput/TextAreaInput";
import {
  ENGLISH_BACKGROUND_LABELS,
  ENGLISH_BACKGROUND_LABELS_JP,
} from "@/lib/data/englishBackground";

// Define the specific string fields that are editable in this component
type EditableInstructorFields =
  | "name"
  | "englishBackground"
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
  | "passcode";

function InstructorProfile({
  instructor,
  token,
  userSessionType,
  isCustomerView = false,
}: {
  instructor: Instructor | InstructorProfile | string;
  token?: string;
  userSessionType?: UserType;
  isCustomerView?: boolean;
}) {
  const [updateResultState, setUpdateResultState] = useState<
    UpdateFormState | undefined
  >(undefined);
  // Handle form messages manually for UpdateFormState
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(
    {},
  );

  const buildLocalMessages = (result: UpdateFormState | undefined) => {
    if (!result) {
      return {};
    }
    const newMessages: Record<string, string> = {};
    if (result.name) newMessages.name = result.name;
    if (result.nickname) newMessages.nickname = result.nickname;
    if (result.email) newMessages.email = result.email;
    if (result.classURL) newMessages.classURL = result.classURL;
    if (result.meetingId) newMessages.meetingId = result.meetingId;
    if (result.passcode) newMessages.passcode = result.passcode;
    if (result.errorMessage) newMessages.errorMessage = result.errorMessage;
    if (language === "ja") {
      Object.keys(newMessages).forEach((field) => {
        newMessages[field] = localizeAdminMessage(newMessages[field]);
      });
    }
    return newMessages;
  };

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
  const [userStatus, setUserStatus] = useState<string>("Active");
  const [leavingDate, setLeavingDate] = useState<string | null>(null);
  const { language } = useLanguage();
  const backgroundLabels =
    language === "ja"
      ? ENGLISH_BACKGROUND_LABELS_JP
      : ENGLISH_BACKGROUND_LABELS;
  const formRef = useRef<HTMLFormElement>(null);
  const englishBackgroundClassNames = ["", "nativeA", "nativeB"] as const;

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

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (latestInstructor) {
      const newEnglishBackground = Number(e.target.value);
      setLatestInstructor({
        ...latestInstructor,
        englishBackground: newEnglishBackground,
      });
    }
  };

  const submissionConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let confirmed = true;
    if (leavingDate && !leavingDate.includes("T") && userStatus === "Leaving") {
      const updatedDate = leavingDate.replace(/-/g, "/");
      confirmed = await confirmAlert(
        language === "ja"
          ? `卒業日が${updatedDate}（日本時間）で正しいか確認してください。`
          : `Please confirm if the leaving date "${updatedDate}" (Japan Time) is correct.`,
        language,
      );
      if (!confirmed) return;
    }

    if (!formRef.current) {
      console.error("formRef is null");
      return;
    }

    const formData = new FormData(formRef.current);
    const result = await updateInstructorAction(undefined, formData);
    setUpdateResultState(result);
    setLocalMessages(buildLocalMessages(result));

    if ("instructor" in result && result.instructor) {
      toast.success(
        language === "ja"
          ? "プロフィールを更新しました"
          : "Profile updated successfully",
      );
      setIsEditing(false);

      const incomingInstructor = result.instructor;
      const shouldKeepIcon =
        typeof incomingInstructor.icon === "string" &&
        token &&
        token !== "" &&
        (incomingInstructor.icon as string).includes(token);
      const updatedInstructor = {
        ...incomingInstructor,
        icon: {
          url: shouldKeepIcon
            ? `${incomingInstructor.icon}?t=${Date.now()}`
            : defaultUserImageUrl,
        },
      };
      setPreviousInstructor(updatedInstructor);
      setLatestInstructor(updatedInstructor);
    } else if ("skipProcessing" in result) {
      return;
    } else if ("errorMessage" in result && result.errorMessage) {
      toast.error(result.errorMessage);
    }
  };

  if (typeof instructor === "string") {
    return <p>{instructor}</p>;
  }

  return (
    <>
      <div className={styles.container}>
        {latestInstructor ? (
          <form
            ref={formRef}
            className={styles.profileCard}
            onSubmit={submissionConfirm}
          >
            <Image
              src={
                latestInstructor.icon.url.includes(defaultUserImageUrl)
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
            <StatusSwitcher
              isEditing={isEditing}
              statusOptions={["Active", "Leaving"]}
              currentStatus={
                latestInstructor.terminationAt === null ? "Active" : "Leaving"
              }
              leavingDate={latestInstructor.terminationAt}
              title={language === "ja" ? "ステータス" : "Status"}
              onStatusChange={(newStatus, newDate) => {
                setUserStatus(newStatus);
                setLeavingDate(newDate ?? null);
              }}
            />

            {isEditing && (
              <>
                {/* Image Uploader */}
                <p className={styles.profileImage__text}>
                  {language === "ja" ? "プロフィール画像" : "Profile image"}
                </p>
                <Uploader />
              </>
            )}

            {/* Name */}
            <div className={styles.instructorName__nameSection}>
              <div className={styles.instructorName__nameLabel}>
                <p className={styles.instructorName__text}>
                  {language === "en" ? "Name" : "名前"}
                </p>
                {!isEditing &&
                latestInstructor.englishBackground !==
                  EnglishBackground.NonNative ? (
                  <div
                    className={`${styles.instructorName__nativeFlag} 
                      ${
                        styles[
                          englishBackgroundClassNames[
                            latestInstructor.englishBackground
                          ]
                        ]
                      }`}
                  >
                    {
                      backgroundLabels[
                        latestInstructor.englishBackground as EnglishBackground
                      ]
                    }
                  </div>
                ) : null}
              </div>
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

            {/* English Background Selection (Radio button) */}
            {isEditing ? (
              <>
                <p className={styles.englishBackground}>
                  {language === "ja"
                    ? "インストラクタータイプ"
                    : "Instructor type"}
                </p>
                <RadioButton
                  name="englishBackground"
                  value={EnglishBackground.NonNative}
                  checked={
                    latestInstructor.englishBackground ===
                    EnglishBackground.NonNative
                  }
                  onChange={handleRadioChange}
                  label={backgroundLabels[EnglishBackground.NonNative]}
                  className={styles.englishBackgroundRadio}
                />
                <RadioButton
                  name="englishBackground"
                  value={EnglishBackground.NativeA}
                  checked={
                    latestInstructor.englishBackground ===
                    EnglishBackground.NativeA
                  }
                  onChange={handleRadioChange}
                  label={backgroundLabels[EnglishBackground.NativeA]}
                  className={styles.englishBackgroundRadio}
                />
                <RadioButton
                  name="englishBackground"
                  value={EnglishBackground.NativeB}
                  checked={
                    latestInstructor.englishBackground ===
                    EnglishBackground.NativeB
                  }
                  onChange={handleRadioChange}
                  label={backgroundLabels[EnglishBackground.NativeB]}
                  className={styles.englishBackgroundRadio}
                />
              </>
            ) : null}

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
                    {latestInstructor.birthdate
                      ? latestInstructor.birthdate.includes(MASKED_BIRTHDATE)
                        ? MASKED_HEAD_LETTERS
                        : formatBirthdateMonthDay(
                            latestInstructor.birthdate,
                            language === "ja" ? "ja-JP" : "en-US",
                          )
                      : null}
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
                  <TextAreaInput
                    id="workingTime"
                    name="workingTime"
                    defaultValue={latestInstructor.workingTime || undefined}
                    onChange={(e) => handleInputChange(e, "workingTime")}
                    inputClassName={`${styles.workingTime__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
                  <TextAreaInput
                    id="lifeHistory"
                    name="lifeHistory"
                    defaultValue={latestInstructor.lifeHistory || undefined}
                    onChange={(e) => handleInputChange(e, "lifeHistory")}
                    inputClassName={`${styles.lifeHistory__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
                  <TextAreaInput
                    name="favoriteFood"
                    defaultValue={latestInstructor.favoriteFood || undefined}
                    onChange={(e) => handleInputChange(e, "favoriteFood")}
                    inputClassName={`${styles.favoriteFood__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
                  <TextAreaInput
                    name="hobby"
                    defaultValue={latestInstructor.hobby || undefined}
                    onChange={(e) => handleInputChange(e, "hobby")}
                    inputClassName={`${styles.hobby__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
                  <TextAreaInput
                    name="messageForChildren"
                    defaultValue={
                      latestInstructor.messageForChildren || undefined
                    }
                    onChange={(e) => handleInputChange(e, "messageForChildren")}
                    inputClassName={`${styles.messageForChildren__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
                  <TextAreaInput
                    name="skill"
                    defaultValue={latestInstructor.skill || undefined}
                    onChange={(e) => handleInputChange(e, "skill")}
                    inputClassName={`${styles.skill__inputField} ${isEditing ? styles.editable : ""}`}
                    containerClassName={styles.textareaInputContainer}
                    unstyled
                    withLabelWrapper={false}
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
            {userSessionType !== "customer" && !isCustomerView && (
              <div className={styles.insideContainer}>
                <EnvelopeIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p>{language === "en" ? "Email" : "メール"}</p>
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
                        ? latestInstructor.email.includes(MASKED_HEAD_LETTERS)
                          ? MASKED_HEAD_LETTERS
                          : latestInstructor.email
                        : language === "ja"
                          ? "未登録"
                          : "Not available"}
                    </h4>
                  )}
                </div>
              </div>
            )}

            {/* Class URL, Meeting ID, and Passcode */}
            {userSessionType !== "customer" && !isCustomerView && (
              <div className={styles.insideContainer}>
                <VideoCameraIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p>{language === "en" ? "Class URL" : "クラスURL"}</p>
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
                          ? latestInstructor.classURL?.includes(
                              MASKED_HEAD_LETTERS,
                            )
                            ? MASKED_HEAD_LETTERS
                            : latestInstructor.classURL
                          : language === "ja"
                            ? "未登録"
                            : "Not available"}
                      </a>
                    </h4>
                  )}

                  <div className={styles.urlInfo}>
                    <p>
                      {language === "en" ? "Meeting ID" : "ミーティングID"}
                      &nbsp;:&nbsp;
                    </p>
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
                          ? latestInstructor.meetingId?.includes(
                              MASKED_HEAD_LETTERS,
                            )
                            ? MASKED_HEAD_LETTERS
                            : latestInstructor.meetingId
                          : language === "ja"
                            ? "未登録"
                            : "Not available"}
                      </p>
                    )}
                  </div>
                  <div className={styles.urlInfo}>
                    <p>
                      {language === "en" ? "Passcode" : "パスコード"}
                      &nbsp;&nbsp;:&nbsp;
                    </p>
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
                          ? latestInstructor.passcode?.includes(
                              MASKED_HEAD_LETTERS,
                            )
                            ? MASKED_HEAD_LETTERS
                            : latestInstructor.passcode
                          : language === "ja"
                            ? "未登録"
                            : "Not available"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isCustomerView &&
              latestInstructor &&
              (userSessionType === "admin" ? (
                <InstructorFeeRates
                  access="admin"
                  instructorId={latestInstructor.id}
                />
              ) : userSessionType === "instructor" ? (
                <InstructorFeeRates access="instructor" />
              ) : null)}

            {(latestInstructor.tags?.length || 0) > 0 && (
              <div className={styles.insideContainer}>
                <SparklesIcon className={styles.icon} />
                <div className={styles.userInfo}>
                  <p className={styles.tagSectionTitle}>
                    {language === "en" ? "Specialties" : "得意分野"}
                  </p>

                  <div className={styles.tagSection}>
                    <div className={styles.tagList}>
                      {latestInstructor.tags.map((tag) => (
                        <span key={tag.id} className={styles.tagChip}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informational message */}
            {userSessionType !== "customer" && !isCustomerView && (
              <div className={styles.insideContainer}>
                <InformationCircleIcon className={styles.icon} />
                <p className={styles.info}>
                  {language === "ja"
                    ? "上記のプロフィール情報の変更を希望する場合は、Facebookでスタッフにご連絡ください。"
                    : "If you wish to update the profile information above, please contact the staff via Facebook."}
                </p>
              </div>
            )}

            {/* Hidden input fields */}
            <input type="hidden" name="id" value={latestInstructor.id} />

            {/* Action buttons for only admin */}
            {userSessionType === "admin" &&
            !isCustomerView &&
            latestInstructor.name !== MASKED_HEAD_LETTERS ? (
              <>
                {isEditing ? (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="cancelEditingInstructor"
                      btnText={language === "ja" ? "キャンセル" : "Cancel"}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelClick();
                      }}
                    />

                    <ActionButton
                      className="saveInstructor"
                      btnText={language === "ja" ? "保存" : "Save"}
                      type="submit"
                      Icon={CheckIcon}
                    />
                  </div>
                ) : (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="editInstructor"
                      btnText={language === "ja" ? "編集" : "Edit"}
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

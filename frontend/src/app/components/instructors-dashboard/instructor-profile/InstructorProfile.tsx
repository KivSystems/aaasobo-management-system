"use client";

import styles from "./InstructorProfile.module.scss";
import { getInstructor, editInstructor } from "@/app/helper/api/instructorsApi";
import { useEffect, useState } from "react";
import Image from "next/image";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  EnvelopeIcon,
  InformationCircleIcon,
  LinkIcon,
  UserCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../elements/loading/Loading";

function InstructorProfile({
  instructorId,
  isAdminAuthenticated,
}: {
  instructorId: number;
  isAdminAuthenticated?: boolean;
}) {
  const [instructor, setInstructor] = useState<Instructor | null>();
  const [latestInstructor, setLatestInstructor] = useState<
    Instructor | undefined
  >();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchInstructorById = async (instructorId: number) => {
      try {
        const id = instructorId;
        const response = await getInstructor(id);
        if ("message" in response) {
          alert(response.message);
          return;
        }
        // console.log("response", response);
        setInstructor(response.instructor);
        setLatestInstructor(response.instructor);
      } catch (error) {
        console.error("Failed to fetch instructor:", error);
      }
    };
    fetchInstructorById(instructorId);
  }, [instructorId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instructor) return;

    // Check if there are any changes
    if (
      instructor.name === latestInstructor?.name &&
      instructor.email === latestInstructor?.email &&
      instructor.classURL === latestInstructor?.classURL &&
      instructor.icon === latestInstructor?.icon &&
      instructor.nickname === latestInstructor?.nickname &&
      instructor.meetingId === latestInstructor?.meetingId &&
      instructor.passcode === latestInstructor?.passcode &&
      instructor.introductionURL === latestInstructor?.introductionURL
    ) {
      return alert("No changes were made.");
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(instructor.email)) {
      return alert("Please enter a valid email address.");
    }

    try {
      const data = await editInstructor(
        instructorId,
        instructor.name,
        instructor.email,
        instructor.classURL,
        instructor.icon,
        instructor.nickname,
        instructor.meetingId,
        instructor.passcode,
        instructor.introductionURL,
      );
      toast.success("Profile edited successfully!");

      setIsEditing(false);
      setInstructor(data.instructor);
      setLatestInstructor(data.instructor);
    } catch (error) {
      console.error("Failed to edit instructor data:", error);
    }
  };

  const handleCancelClick = () => {
    if (latestInstructor) {
      setInstructor(latestInstructor);
      setIsEditing(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <h2>Profile Page</h2>
      <div className={styles.container}>
        {instructor ? (
          <form className={styles.profileCard} onSubmit={handleFormSubmit}>
            <Image
              src={`/instructors/${instructor.icon}`}
              alt={instructor.name}
              width={100}
              height={100}
              priority
              className={styles.pic}
            />

            {/* Instructor name */}
            <div className={styles.instructorName__nameSection}>
              <p className={styles.instructorName__text}>Name</p>
              {isEditing ? (
                <input
                  className={`${styles.instructorName__inputField} ${isEditing ? styles.editable : ""}`}
                  type="text"
                  value={instructor.name}
                  onChange={(e) => {
                    if (isEditing && isAdminAuthenticated) {
                      setInstructor({ ...instructor, name: e.target.value });
                    }
                  }}
                  required
                />
              ) : (
                <h3 className={styles.instructorName__name}>
                  {instructor.name}
                </h3>
              )}
            </div>

            {/* Instructor nickname */}
            <div className={styles.insideContainer}>
              <UserCircleIcon className={styles.icon} />
              <div>
                <p>Nickname</p>
                {isEditing ? (
                  <input
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                    type="text"
                    value={instructor.nickname}
                    onChange={(e) => {
                      if (isEditing && isAdminAuthenticated) {
                        setInstructor({
                          ...instructor,
                          nickname: e.target.value,
                        });
                      }
                    }}
                    required
                  />
                ) : (
                  <h4>{instructor.nickname}</h4>
                )}
              </div>
            </div>

            {/* Instructor email */}
            <div className={styles.insideContainer}>
              <EnvelopeIcon className={styles.icon} />
              <div>
                <p>Email</p>
                {isEditing ? (
                  <input
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                    type="email"
                    value={instructor.email}
                    onChange={(e) => {
                      if (isEditing) {
                        setInstructor({ ...instructor, email: e.target.value });
                      }
                    }}
                    required
                  />
                ) : (
                  <h4>{instructor.email}</h4>
                )}
              </div>
            </div>

            {/* Instructor Class URL, Meeting ID, and Passcode */}
            <div className={styles.insideContainer}>
              <VideoCameraIcon className={styles.icon} />
              <div>
                <p>Class URL</p>
                {isEditing ? (
                  <input
                    className={`${styles.classUrl__inputField} ${isEditing ? styles.editable : ""}`}
                    type="text"
                    value={instructor.classURL}
                    onChange={(e) => {
                      if (isEditing) {
                        setInstructor({
                          ...instructor,
                          classURL: e.target.value,
                        });
                      }
                    }}
                    required
                  />
                ) : (
                  <h4>
                    <a
                      href={instructor.classURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.url}
                    >
                      {instructor.classURL}
                    </a>
                  </h4>
                )}

                <div className={styles.urlInfo}>
                  <p>Meeting ID&nbsp;:&nbsp;</p>
                  {isEditing ? (
                    <input
                      className={`${styles.meetingId__inputField} ${isEditing ? styles.editable : ""}`}
                      type="text"
                      value={instructor.meetingId}
                      onChange={(e) => {
                        if (isEditing) {
                          setInstructor({
                            ...instructor,
                            meetingId: e.target.value,
                          });
                        }
                      }}
                      required
                    />
                  ) : (
                    <p>{instructor.meetingId}</p>
                  )}
                </div>
                <div className={styles.urlInfo}>
                  <p>Passcode&nbsp;&nbsp;:&nbsp;</p>
                  {isEditing ? (
                    <input
                      className={`${styles.passcode__inputField} ${isEditing ? styles.editable : ""}`}
                      type="text"
                      value={instructor.passcode}
                      onChange={(e) => {
                        if (isEditing) {
                          setInstructor({
                            ...instructor,
                            passcode: e.target.value,
                          });
                        }
                      }}
                      required
                    />
                  ) : (
                    <p>{instructor.passcode}</p>
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
                  <input
                    className={`${styles.selfIntroduction__inputField} ${isEditing ? styles.editable : ""}`}
                    type="text"
                    value={instructor.introductionURL}
                    onChange={(e) => {
                      if (isEditing) {
                        setInstructor({
                          ...instructor,
                          introductionURL: e.target.value,
                        });
                      }
                    }}
                    required
                  />
                ) : (
                  <h4>
                    <a
                      href={instructor.introductionURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.url}
                    >
                      {instructor.introductionURL}
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

"use client";

import styles from "./AdminProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateUser } from "@/app/actions/updateUser";
import InputField from "../elements/inputField/InputField";
import ActionButton from "../elements/buttons/actionButton/ActionButton";
import { CheckIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/elements/loading/Loading";

function AdminProfile({
  admin,
  isAdminAuthenticated,
}: {
  admin: Admin | string;
  isAdminAuthenticated?: boolean;
}) {
  const [updateResultState, formAction] = useFormState(updateUser, {});
  const [previousAdmin, setPreviousAdmin] = useState<Admin | null>(
    typeof admin !== "string" ? admin : null,
  );
  const [latestAdmin, setLatestAdmin] = useState<Admin | null>(
    typeof admin !== "string" ? admin : null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Admin,
  ) => {
    if (latestAdmin) {
      setLatestAdmin({ ...latestAdmin, [field]: e.target.value });
    }
  };

  const handleCancelClick = () => {
    if (latestAdmin) {
      setLatestAdmin(previousAdmin);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("admin" in updateResultState) {
        const result = updateResultState as { admin: Admin };
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setPreviousAdmin(result.admin);
        setLatestAdmin(result.admin);
      } else {
        const result = updateResultState as { errorMessage: string };
        toast.error(result.errorMessage);
      }
    }
  }, [updateResultState]);

  if (typeof admin === "string") {
    return <p>{admin}</p>;
  }

  return (
    <>
      <h2>Profile Page</h2>
      <div className={styles.container}>
        {latestAdmin ? (
          <form action={formAction} className={styles.profileCard}>
            {/* Admin name */}
            <div className={styles.adminName__nameSection}>
              <p className={styles.adminName__text}>Name</p>
              {isEditing ? (
                <InputField
                  name="name"
                  value={latestAdmin.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  className={`${styles.adminName__inputField} ${isEditing ? styles.editable : ""}`}
                />
              ) : (
                <h3 className={styles.adminName__name}>{latestAdmin.name}</h3>
              )}
            </div>

            {/* Admin email */}
            <div className={styles.insideContainer}>
              <EnvelopeIcon className={styles.icon} />
              <div>
                <p>Email</p>
                {isEditing ? (
                  <InputField
                    name="email"
                    type="email"
                    value={latestAdmin.email}
                    onChange={(e) => handleInputChange(e, "email")}
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>{latestAdmin.email}</h4>
                )}
              </div>
            </div>

            {/* Hidden input fields */}
            <input type="hidden" name="userType" value="admin" />
            <input type="hidden" name="id" value={latestAdmin.id} />

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

export default AdminProfile;

"use client";

import styles from "./AdminProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { updateAdminAction } from "@/app/actions/updateUser";
import { deleteAdminAction } from "@/app/actions/deleteUser";
import {
  ADMIN_UPDATE_SUCCESS_MESSAGE,
  ADMIN_DELETE_SUCCESS_MESSAGE,
} from "@/app/helper/messages/formValidation";
import InputField from "../elements/inputField/InputField";
import ActionButton from "../elements/buttons/actionButton/ActionButton";
import { CheckIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/elements/loading/Loading";

function AdminProfile({
  userId,
  admin,
  isAdminAuthenticated,
}: {
  userId: number;
  admin: Admin | string;
  isAdminAuthenticated?: boolean;
}) {
  // Use `useFormState` hook for updating an admin profile
  const [updateResultState, formAction] = useFormState(updateAdminAction, {});
  // Use `useState` hook and FormData for deleting an admin profile
  const [deleteResultState, setDeleteResultState] = useState<DeleteFormState>(
    {},
  );
  const { localMessages, clearErrorMessage } =
    useFormMessages(updateResultState);
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
      clearErrorMessage(field);
    }
  };

  const handleCancelClick = () => {
    if (latestAdmin) {
      setLatestAdmin(previousAdmin);
      setIsEditing(false);
      clearErrorMessage("email");
    }
  };

  const handleDeleteClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this admin's profile?",
    );
    if (confirmed && latestAdmin) {
      const formData = new FormData();
      formData.append("id", String(latestAdmin.id));

      const result = await deleteAdminAction(deleteResultState, formData);
      setDeleteResultState(result);
    }
  };

  useEffect(() => {
    // Check if the updateResultState has changed
    if ("admin" in updateResultState && updateResultState.admin) {
      const admin = updateResultState.admin as Admin;
      toast.success(ADMIN_UPDATE_SUCCESS_MESSAGE);
      setIsEditing(false);
      setPreviousAdmin(admin);
      setLatestAdmin(admin);
      // Clear updateResultState to avoid re-rendering
      updateResultState.admin = null;
      return;

      // Check if the deleteResultState has changed
    } else if ("id" in deleteResultState && deleteResultState.id) {
      toast.success(ADMIN_DELETE_SUCCESS_MESSAGE);
      setIsEditing(false);
      setLatestAdmin(null);
      // Clear deleteResultState to avoid re-rendering
      deleteResultState.id = null;
      return;

      // Show an error message if there is an error in either update or delete operation,
    } else {
      const updateResult = updateResultState as { errorMessage: string };
      const deleteResult = deleteResultState as { errorMessage: string };
      const errorMessage =
        updateResult.errorMessage || deleteResult.errorMessage;
      toast.error(errorMessage);
      return;
    }
  }, [updateResultState, deleteResultState]);

  // Error message is displayed if the admin data is not found.
  if (typeof admin === "string") {
    return <p>{admin}</p>;
  }
  const adminId = admin.id;

  return (
    <>
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
                    error={localMessages.email}
                    onChange={(e) => handleInputChange(e, "email")}
                    className={`${styles.email__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h4>{latestAdmin.email}</h4>
                )}
              </div>
            </div>

            {/* Hidden input field */}
            <input type="hidden" name="id" value={latestAdmin.id} />

            {/* Action buttons for only admin */}
            {isAdminAuthenticated &&
              (isEditing ? (
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
                  <div>
                    <ActionButton
                      className="deleteAdmin"
                      btnText="Delete"
                      type="button"
                      onClick={() => handleDeleteClick()}
                      disabled={userId === adminId}
                    />
                  </div>
                  <div>
                    <ActionButton
                      className="editAdmin"
                      btnText="Edit"
                      type="button"
                      onClick={handleEditClick}
                    />
                  </div>
                </div>
              ))}
          </form>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default AdminProfile;

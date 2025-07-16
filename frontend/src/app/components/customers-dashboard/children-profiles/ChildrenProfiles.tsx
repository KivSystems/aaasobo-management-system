"use client";

import styles from "./ChildrenProfiles.module.scss";
import { deleteChild } from "@/app/helper/api/childrenApi";
import {
  PlusIcon,
  UserCircleIcon as UserCircleSolid,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { formatBirthdateToISO } from "@/app/helper/utils/dateUtils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RedirectButton from "../../elements/buttons/redirectButton/RedirectButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFormState } from "react-dom";
import { updateChildProfileAction } from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import BirthdateInput from "../../features/registerForm/birthdateInput/BirthdateInput";
import TextAreaInput from "../../elements/textAreaInput/TextAreaInput";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

function ChildrenProfiles({
  customerId,
  childProfiles,
  adminId,
  isAdminAuthenticated,
}: {
  customerId: number;
  childProfiles: Child[];
  adminId?: number;
  isAdminAuthenticated?: boolean;
}) {
  const [profileUpdateResult, formAction] = useFormState(
    updateChildProfileAction,
    undefined,
  );
  const { localMessages, clearErrorMessage } =
    useFormMessages<LocalizedMessages>(profileUpdateResult);

  const [children, setChildren] = useState<Child[] | undefined>([]);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editingSuccessChildId, setEditingSuccessChildId] = useState<
    number | null
  >(null);

  const addChildUrl = isAdminAuthenticated
    ? `/admins/${adminId}/customer-list/${customerId}/children-profiles/add-child`
    : `children-profiles/add-child`;

  const { language } = useLanguage();

  const isError = !!localMessages.errorMessage;
  const isSuccess = !!localMessages.successMessage;

  // If the profile update was successful, exit editing mode.
  useEffect(() => {
    if (profileUpdateResult !== undefined) {
      if (profileUpdateResult.successMessage) {
        setEditingSuccessChildId(editingChildId);
        setEditingChildId(null);
      }
    }
  }, [profileUpdateResult]);

  const handleDeleteClick = async (childId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this child's profile?",
    );
    if (!confirmed) return;

    try {
      const deletedChildData = await deleteChild(childId);
      setChildren((prevChildren) =>
        prevChildren?.filter((child) => child.id !== childId),
      );

      toast.success(deletedChildData.message);
    } catch (error) {
      console.error("Failed to delete the child profile:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addBtn}>
        <RedirectButton
          linkURL={addChildUrl}
          btnText={language === "ja" ? "お子様を追加" : "Add Child"}
          className="addBtn"
          Icon={PlusIcon}
        />
      </div>

      <div className={styles.children}>
        {childProfiles.map((child) => (
          <form className={styles.childCard} key={child.id} action={formAction}>
            <div className={styles.childCard__profile}>
              {/* Child Name */}
              <div className={styles.childName}>
                <div className={styles.childName__profileIconContainer}>
                  <UserCircleSolid className={styles.childName__profileIcon} />
                </div>

                <label className={styles.childName__label}>
                  <p className={styles.childName__text}>
                    {language === "ja" ? "名前" : "Name"}
                  </p>

                  {editingChildId === child.id ? (
                    <InputField
                      name="name"
                      type="text"
                      placeholder={
                        language === "ja"
                          ? "お子さまのお名前(ローマ字で)"
                          : "Child's name (in English)"
                      }
                      defaultValue={child.name}
                      className={styles.childName__inputField}
                      onChange={() => clearErrorMessage("name")}
                      error={localMessages.name?.[language]}
                    />
                  ) : (
                    <div className={styles.childName__name}>{child.name}</div>
                  )}
                </label>
              </div>

              {/* Birthdate */}
              <div className={styles.birthdate}>
                <label className={styles.birthdate__label}>
                  <p className={styles.birthdate__text}>
                    {language === "ja" ? "生年月日" : "Date of birth"}
                  </p>

                  {editingChildId === child.id ? (
                    <BirthdateInput
                      defaultBirthdate={formatBirthdateToISO(child.birthdate)}
                      error={localMessages.birthdate?.[language]}
                      language={language}
                    />
                  ) : (
                    <div className={styles.profileInfo}>
                      <div className={styles.profileInfo__data}>
                        {formatBirthdateToISO(child.birthdate)}
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Personal Info */}
              <div className={styles.personalInfo}>
                <label className={styles.personalInfo__label}>
                  <p className={styles.personalInfo__text}>
                    {language === "ja" ? "プロフィール" : "Profile"}
                  </p>

                  {editingChildId === child.id ? (
                    <TextAreaInput
                      defaultValue={child.personalInfo}
                      placeholder={
                        language === "ja"
                          ? "例. 5 years old, Beginner, Car, Peppapig"
                          : "e.g., 5 years old, Beginner, Car, Peppapig"
                      }
                      error={localMessages.personalInfo?.[language]}
                      onChange={(e) => {
                        clearErrorMessage("personalInfo");
                      }}
                      required
                      language={language}
                      name="personalInfo"
                      className="childProfile"
                    />
                  ) : (
                    <div className={styles.profileInfo}>
                      <div className={styles.profileInfo__data}>
                        {child.personalInfo}
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.messageWrapper}>
              {((isError && child.id === editingChildId) ||
                (isSuccess && child.id === editingSuccessChildId)) && (
                <FormValidationMessage
                  type={isError ? "error" : "success"}
                  message={
                    isError
                      ? localMessages.errorMessage[language]
                      : localMessages.successMessage[language]
                  }
                />
              )}
            </div>

            {editingChildId === child.id ? (
              <div className={styles.childCard__buttons}>
                <ActionButton
                  className="cancelEditingCustomer"
                  btnText={language === "ja" ? "キャンセル" : "Cancel"}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearErrorMessage("all");
                    setEditingChildId(null);
                  }}
                />

                <ActionButton
                  className="saveCustomer"
                  btnText={language === "ja" ? "変更を保存" : "Save"}
                  type="submit"
                />
              </div>
            ) : (
              <div className={styles.childCard__buttons}>
                <ActionButton
                  className="deleteChild"
                  btnText="Delete"
                  onClick={() => handleDeleteClick(child.id)}
                  disabled={editingChildId !== null}
                />
                <ActionButton
                  className="editChild"
                  btnText={language === "ja" ? "編集" : "Edit"}
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingChildId(child.id);
                    setEditingSuccessChildId(null);
                  }}
                  disabled={editingChildId !== null}
                />
              </div>
            )}

            {/* Hidden fields to include in form submission */}
            {/* For security, pass the customer ID through a hidden input only if the admin is authenticated */}
            {isAdminAuthenticated && (
              <input
                type="hidden"
                name="customerId"
                value={child.customerId ?? ""}
              />
            )}
            <input type="hidden" name="id" value={child.id ?? ""} />
          </form>
        ))}
      </div>
    </div>
  );
}

export default ChildrenProfiles;

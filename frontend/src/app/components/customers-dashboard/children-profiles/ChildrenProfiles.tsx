"use client";

import styles from "./ChildrenProfiles.module.scss";
import {
  PlusIcon,
  UserCircleIcon as UserCircleSolid,
} from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { formatBirthdateToISO } from "@/app/helper/utils/dateUtils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFormState } from "react-dom";
import {
  addChildProfileAction,
  updateChildProfileAction,
} from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import BirthdateInput from "../../features/registerForm/birthdateInput/BirthdateInput";
import TextAreaInput from "../../elements/textAreaInput/TextAreaInput";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";
import {
  CANNOT_DELETE_LAST_CHILD_PROFILE_MESSAGE,
  CONFIRM_DELETE_CHILD_PROFILE_MESSAGE,
} from "@/app/helper/messages/customerDashboard";
import { deleteChildProfileAction } from "@/app/actions/deleteUser";
import Modal from "../../elements/modal/Modal";
import AddChildForm from "./AddChildForm";

function ChildrenProfiles({
  customerId,
  childProfiles,
  isAdminAuthenticated,
}: ChildrenProfilesProps) {
  const [updateResult, updateAction] = useFormState(
    updateChildProfileAction,
    undefined,
  );
  const [addResult, addAction] = useFormState(addChildProfileAction, undefined);
  const { localMessages, setLocalMessages, clearErrorMessage } =
    useFormMessages<LocalizedMessages>();
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editingSuccessChildId, setEditingSuccessChildId] = useState<
    number | null
  >(null);
  const handleBirthdateChange = useCallback(() => {
    clearErrorMessage("birthdate");
  }, [clearErrorMessage]);
  const { language } = useLanguage();
  const isError = !!localMessages.errorMessage;
  const isSuccess = !!localMessages.successMessage;

  useEffect(() => {
    if (updateResult !== undefined) {
      setLocalMessages(updateResult);
      if (updateResult.successMessage) {
        setEditingSuccessChildId(editingChildId);
        setEditingChildId(null);
      }
    }
  }, [updateResult, editingChildId, setLocalMessages]);

  useEffect(() => {
    if (addResult !== undefined) {
      setLocalMessages(addResult);
      if (addResult.successMessage) {
        toast.success(addResult.successMessage[language]);
        setIsAddChildModalOpen(false);
      }
    }
  }, [addResult, language, setLocalMessages]);

  const handleDeleteClick = async (childId: number) => {
    const hasOnlyOneChild = childProfiles.length === 1;

    if (hasOnlyOneChild)
      return alert(CANNOT_DELETE_LAST_CHILD_PROFILE_MESSAGE[language]);

    const confirmed = window.confirm(
      CONFIRM_DELETE_CHILD_PROFILE_MESSAGE[language],
    );
    if (!confirmed) return;

    const resultMessage = await deleteChildProfileAction(childId, customerId);

    if (resultMessage.successMessage) {
      toast.success(resultMessage.successMessage[language]);
    } else if (resultMessage.errorMessage) {
      alert(resultMessage.errorMessage[language]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addBtn}>
        <ActionButton
          btnText={language === "ja" ? "お子さまを追加" : "Add Child"}
          className="addBtn"
          Icon={PlusIcon}
          onClick={(e) => {
            e.preventDefault();
            setEditingChildId(null);
            clearErrorMessage("all");
            setIsAddChildModalOpen(true);
          }}
        />
      </div>

      <Modal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        className="rebooking"
      >
        <AddChildForm
          language={language}
          action={addAction}
          customerId={customerId}
          localMessages={localMessages}
          isAdminAuthenticated={isAdminAuthenticated}
          isError={isError}
          clearErrorMessage={clearErrorMessage}
        />
      </Modal>

      <div className={styles.children}>
        {childProfiles.map((child) => (
          <form
            className={styles.childCard}
            key={child.id}
            action={updateAction}
          >
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
                      onValidDateChange={handleBirthdateChange}
                      defaultBirthdate={formatBirthdateToISO(child.birthdate)}
                      error={localMessages.birthdate?.[language]}
                      language={language}
                      useFormAction={true}
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
                  btnText={language === "ja" ? "削除" : "Delete"}
                  onClick={() => handleDeleteClick(child.id)}
                  disabled={editingChildId !== null}
                />
                <ActionButton
                  className="editChild"
                  btnText={language === "ja" ? "編集" : "Edit"}
                  onClick={(e) => {
                    e.preventDefault();
                    clearErrorMessage("all");
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

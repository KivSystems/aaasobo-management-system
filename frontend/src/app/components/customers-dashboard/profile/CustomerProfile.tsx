"use client";

import styles from "./CustomerProfile.module.scss";
import { useEffect, useState } from "react";
import {
  UserCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFormState } from "react-dom";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { updateCustomerProfileAction } from "@/app/actions/updateUser";
import { deactivateCustomerAction } from "@/app/actions/deleteUser";
import InputField from "../../elements/inputField/InputField";
import PrefectureSelect from "../../features/registerForm/prefectureSelect/PrefectureSelect";
import { getLocalizedText } from "@/app/helper/utils/stringUtils";
import { getLongMonth } from "@/app/helper/utils/dateUtils";
import { MASKED_HEAD_LETTERS } from "@/app/helper/data/data";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

function CustomerProfile({
  customerProfile,
  userSessionType,
}: {
  customerProfile: CustomerProfile;
  userSessionType?: UserType;
}) {
  // Use `useFormState` hook for updating a customer profile
  const [profileUpdateResult, formAction] = useFormState(
    updateCustomerProfileAction,
    undefined,
  );
  // Use `useState` hook and FormData for deactivating a customer profile
  const [deleteResultState, setDeleteResultState] = useState<DeleteFormState>(
    {},
  );
  const [isEditing, setIsEditing] = useState(false);

  const { language } = useLanguage();
  const { localMessages, clearErrorMessage } =
    useFormMessages<LocalizedMessages>(profileUpdateResult);

  const localizedCustomerPrefecture = getLocalizedText(
    customerProfile.prefecture,
    language,
  );
  const [dateInfo, setDateInfo] = useState<{
    fullDate: string;
    month: number;
    date: number;
    year: number;
  }>({
    fullDate: "",
    month: 0,
    date: 0,
    year: 0,
  });

  const isError = !!localMessages.errorMessage;
  const isSuccess = !!localMessages.successMessage;

  const handleDeactivateClick = async () => {
    const confirmed = window.confirm(
      `Are you sure to deactivate this customer? This action cannot be undone.`,
    );
    if (confirmed && customerProfile) {
      const formData = new FormData();
      formData.append("id", String(customerProfile.id));

      const result = await deactivateCustomerAction(
        deleteResultState,
        formData,
      );
      setDeleteResultState(result);
    }
  };

  useEffect(() => {
    // Set date info
    if (customerProfile.terminationAt) {
      const fullDate = customerProfile.terminationAt.split("T")[0];
      const targetDate = new Date(fullDate);
      const month = targetDate.getMonth();
      const date = targetDate.getDate();
      const year = targetDate.getFullYear();
      setDateInfo({ fullDate, month, date, year });
    }
  }, [customerProfile.terminationAt]);

  // If the profile update was successful, exit editing mode.
  useEffect(() => {
    if (profileUpdateResult !== undefined) {
      if (profileUpdateResult.successMessage) {
        setIsEditing(false);
      }
    }
  }, [profileUpdateResult]);

  return (
    <form className={styles.profileCard} action={formAction}>
      {/* Customer Name */}
      <label className={styles.customerName}>
        <div className={styles.customerName__profileIconContainer}>
          <UserCircleIcon className={styles.customerName__profileIcon} />
        </div>

        <div className={styles.customerName__nameSection}>
          <p className={styles.customerName__text}>
            {language === "ja" ? "名前" : "Name"}
          </p>
          {isEditing ? (
            <InputField
              name="name"
              type="text"
              defaultValue={customerProfile.name}
              className={styles.customerName__inputField}
              onChange={() => clearErrorMessage("name")}
              error={localMessages.name?.[language]}
            />
          ) : (
            <div
              className={styles.customerName__name}
              title={customerProfile.name}
            >
              {customerProfile.name}
            </div>
          )}
        </div>
      </label>

      {/* Customer email */}
      <label className={styles.email}>
        <div className={styles.email__title}>
          {language === "ja" ? "メール" : "e-mail"}
        </div>
        {isEditing ? (
          <InputField
            name="email"
            type="email"
            defaultValue={customerProfile.email}
            className={styles.email__inputField}
            onChange={() => clearErrorMessage("email")}
            error={localMessages.email?.[language]}
          />
        ) : (
          <div className={styles.email__name}>
            <span title={customerProfile.email}>
              {customerProfile.email.includes(MASKED_HEAD_LETTERS)
                ? customerProfile.email.split("@")[0]
                : customerProfile.email}
            </span>
          </div>
        )}
      </label>

      {/* Customer prefecture */}
      <label className={styles.customerHome}>
        <div className={styles.customerHome__title}>
          {language === "ja" ? "お住まいの都道府県" : "Prefecture of residence"}
        </div>

        {isEditing ? (
          <PrefectureSelect
            error={localMessages.prefecture?.[language]}
            onChange={(e) => {
              clearErrorMessage("prefecture");
            }}
            language={language}
            defaultValue={customerProfile.prefecture}
            className="customerProfile"
            withIcon={false}
          />
        ) : (
          <div className={styles.customerHome__name}>
            {localizedCustomerPrefecture}
          </div>
        )}
      </label>

      <div className={styles.messageWrapper}>
        {(isError || isSuccess) && (
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

      {isEditing ? (
        <div className={styles.buttons}>
          <ActionButton
            className="cancelEditingCustomer"
            btnText={language === "ja" ? "キャンセル" : "Cancel"}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              clearErrorMessage("all");
              setIsEditing(false);
            }}
          />

          <ActionButton
            className="saveCustomer"
            btnText={language === "ja" ? "変更を保存" : "Save"}
            type="submit"
          />
        </div>
      ) : (
        <>
          {customerProfile.terminationAt ? (
            <div className={styles.userLeft}>
              <ExclamationTriangleIcon className={styles.userLeft__icon} />
              <p className={styles.userLeft__text}>
                {`Left on ${getLongMonth(new Date(dateInfo.fullDate))} ${dateInfo.date}, ${dateInfo.year} (Japan Time)`}
              </p>
            </div>
          ) : (
            <div className={styles.buttons}>
              {userSessionType === "admin" ? (
                <ActionButton
                  className="deactivateCustomer"
                  btnText={"Deactivate"}
                  type="button"
                  onClick={handleDeactivateClick}
                />
              ) : null}
              <ActionButton
                className="editCustomer"
                btnText={language === "ja" ? "プロフィールを編集" : "Edit"}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                  clearErrorMessage("all");
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Hidden fields to include in form submission */}
      {/* For security, pass the customer ID through a hidden input only if the admin is authenticated */}
      {userSessionType === "admin" && (
        <input type="hidden" name="id" value={customerProfile.id ?? ""} />
      )}
      <input
        type="hidden"
        name="currentName"
        value={customerProfile.name ?? ""}
      />
      <input
        type="hidden"
        name="currentEmail"
        value={customerProfile.email ?? ""}
      />
      <input
        type="hidden"
        name="currentPrefecture"
        value={customerProfile.prefecture ?? ""}
      />
      <input type="hidden" name="language" value={language ?? "en"} />
    </form>
  );
}

export default CustomerProfile;

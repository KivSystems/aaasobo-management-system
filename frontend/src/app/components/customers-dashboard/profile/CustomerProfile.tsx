"use client";

import styles from "./CustomerProfile.module.scss";
import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFormState } from "react-dom";
import { useFormMessages } from "@/app/hooks/useFormMessages";
import { updateCustomerProfileAction } from "@/app/actions/updateUser";
import InputField from "../../elements/inputField/InputField";
import PrefectureSelect from "../../features/registerForm/prefectureSelect/PrefectureSelect";
import { getLocalizedPrefecture } from "@/app/helper/utils/stringUtils";
import FormValidationMessage from "../../elements/formValidationMessage/FormValidationMessage";

function CustomerProfile({
  customerProfile,
  isAdminAuthenticated,
}: {
  customerProfile: CustomerProfile;
  isAdminAuthenticated?: boolean;
}) {
  const [profileUpdateResult, formAction] = useFormState(
    updateCustomerProfileAction,
    undefined,
  );
  const [isEditing, setIsEditing] = useState(false);

  const { localMessages, clearErrorMessage } =
    useFormMessages(profileUpdateResult);
  const { language } = useLanguage();

  const localizedCustomerPrefecture = getLocalizedPrefecture(
    customerProfile.prefecture,
    language,
  );

  const isError = !!localMessages.errorMessage;
  const isSuccess = !!localMessages.successMessage;

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
              error={localMessages.name}
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
            error={localMessages.email}
          />
        ) : (
          <div className={styles.email__name}>
            <span title={customerProfile.email}>{customerProfile.email}</span>
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
            clearErrorMessage={clearErrorMessage}
            errorMessage={localMessages.prefecture}
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
                ? localMessages.errorMessage
                : localMessages.successMessage
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
              clearErrorMessage("errorMessage");
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
        <div className={styles.buttons}>
          <ActionButton
            className="editCustomer"
            btnText={language === "ja" ? "プロフィールを編集" : "Edit Profile"}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
              clearErrorMessage("errorMessage");
            }}
          />
        </div>
      )}

      {/* Hidden fields to include in form submission */}

      {/* For security, pass the customer ID through a hidden input only if the admin is authenticated */}
      {isAdminAuthenticated && (
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

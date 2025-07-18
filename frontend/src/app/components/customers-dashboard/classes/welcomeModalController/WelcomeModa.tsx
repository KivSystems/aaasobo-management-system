"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import styles from "./WelcomModal.module.scss";
import { markWelcomeSeen } from "@/app/helper/api/customersApi";
import {
  CHILD_PROFILE_UPDATE_INSTRUCTION_MESSAGE,
  FREE_TRIAL_BOOKING_INSTRUCTION_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
  WELCOME_MODAL_TITLE,
} from "@/app/helper/messages/customerDashboard";
import { validateSession } from "@/app/actions/validateSession";
import { confirmAndDeclineFreeTrialClass } from "@/app/helper/utils/confirmAndDeclineFreeTrialClass";

export default function WelcomeModal({
  customerId,
  language,
  setIsWelcomeModalOpen,
  isAdminAuthenticated,
}: WelcomeModalProps) {
  const handleClick = async () => {
    const { isValid, error } = await validateSession(
      customerId,
      isAdminAuthenticated,
    );

    if (!isValid) {
      return alert(
        error === "unauthorized" ? LOGIN_REQUIRED_MESSAGE[language] : error,
      );
    }

    await markWelcomeSeen(customerId);

    setIsWelcomeModalOpen(false);
  };

  return (
    <div className={styles.welcomeModal}>
      <h2 className={styles.welcomeModal__title}>
        {WELCOME_MODAL_TITLE[language]}
      </h2>

      <p className={styles.welcomeModal__description}>
        - {FREE_TRIAL_BOOKING_INSTRUCTION_MESSAGE[language]}
      </p>
      <p className={styles.welcomeModal__declineClass}>
        {language === "ja"
          ? "※ 無料トライアルクラスが不要な方は、"
          : "※ If you don't need a free trial class, "}
        <span
          className={styles.welcomeModal__link}
          onClick={() =>
            confirmAndDeclineFreeTrialClass({
              customerId,
              isAdminAuthenticated,
              language,
            })
          }
        >
          {language === "ja" ? "こちら" : "click here"}
        </span>
        {language === "ja" ? "をクリックしてください。" : "."}
      </p>

      <p className={styles.welcomeModal__description}>
        - {CHILD_PROFILE_UPDATE_INSTRUCTION_MESSAGE[language]}
      </p>

      <div className={styles.welcomeModal__button}>
        <ActionButton
          btnText={language == "ja" ? "はじめる" : "Get Started"}
          className="startBtn"
          type="button"
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

"use client";

import { validateSession } from "@/app/actions/validateSession";
import {
  FREE_TRIAL_DECLINE_CONFIRMATION_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
} from "../messages/customerDashboard";
import { declineFreeTrialClass } from "../api/customersApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { errorAlert, confirmAlert } from "@/app/helper/utils/alertUtils";

export const confirmAndDeclineFreeTrialClass = async ({
  customerId,
  userSessionType,
  language,
  classCode,
}: {
  customerId: number;
  userSessionType?: UserType;
  language: LanguageType;
  classCode?: string;
}) => {
  const { isValid, error } = await validateSession(customerId);

  if (!isValid) {
    return errorAlert(
      error === "unauthorized"
        ? LOGIN_REQUIRED_MESSAGE[language]
        : (error as string),
    );
  }

  const confirmed = await confirmAlert(
    FREE_TRIAL_DECLINE_CONFIRMATION_MESSAGE[language],
  );
  if (!confirmed) return;

  const { success, message } = await declineFreeTrialClass(
    customerId,
    classCode,
  );

  if (success) {
    revalidateCustomerCalendar(customerId, userSessionType);
  }

  return errorAlert(message[language]);
};

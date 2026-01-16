"use client";

import { validateSession } from "@/app/actions/validateSession";
import {
  FREE_TRIAL_DECLINE_CONFIRMATION_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
} from "../messages/customerDashboard";
import { declineFreeTrialClass } from "../api/customersApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";
import { errorAlert, confirmAlert, successAlert } from "@/lib/utils/alertUtils";

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
  console.log("confirmAndDeclineFreeTrialClass classCode:", classCode);

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

  if (!success) {
    return errorAlert(message[language]);
  }

  revalidateCustomerCalendar(customerId, userSessionType);
  return successAlert(message[language]);
};

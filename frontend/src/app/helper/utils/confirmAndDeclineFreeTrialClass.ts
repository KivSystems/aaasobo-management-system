import { validateSession } from "@/app/actions/validateSession";
import {
  FREE_TRIAL_DECLINE_CONFIRMATION_MESSAGE,
  LOGIN_REQUIRED_MESSAGE,
} from "../messages/customerDashboard";
import { declineFreeTrialClass } from "../api/customersApi";
import { revalidateCustomerCalendar } from "@/app/actions/revalidate";

export const confirmAndDeclineFreeTrialClass = async ({
  customerId,
  isAdminAuthenticated,
  language,
  classCode,
}: {
  customerId: number;
  isAdminAuthenticated?: boolean;
  language: LanguageType;
  classCode?: string;
}) => {
  const { isValid, error } = await validateSession(
    customerId,
    isAdminAuthenticated,
  );

  if (!isValid) {
    return alert(
      error === "unauthorized" ? LOGIN_REQUIRED_MESSAGE[language] : error,
    );
  }

  const confirmed = window.confirm(
    FREE_TRIAL_DECLINE_CONFIRMATION_MESSAGE[language],
  );
  if (!confirmed) return;

  const { success, message } = await declineFreeTrialClass(
    customerId,
    classCode,
  );

  if (success) {
    revalidateCustomerCalendar(customerId, isAdminAuthenticated);
  }

  return alert(message[language]);
};

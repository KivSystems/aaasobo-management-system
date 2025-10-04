import { CANCELATION_NOT_ALLOWED_MESSAGE } from "../messages/customerDashboard";
import { isPastPreviousDayDeadline } from "./dateUtils";

type RegisterProps = {
  name: string;
  email: string;
  password: string;
  passConfirmation: string;
};

type LoginProps = {
  email: string;
  password: string;
};

export const validateCancelableClasses = (
  selectedClasses: ClassInfoList,
  setSelectedClasses: SetClassInfoList,
  language: LanguageType,
): boolean => {
  const pastPrevDayClasses = selectedClasses.filter((eachClass) =>
    isPastPreviousDayDeadline(eachClass.classDateTime),
  );

  if (pastPrevDayClasses.length > 0) {
    alert(CANCELATION_NOT_ALLOWED_MESSAGE[language]);

    const updatedSelectedClasses = selectedClasses.filter(
      (eachClass) =>
        !pastPrevDayClasses.some(
          (pastClass) => pastClass.classId === eachClass.classId,
        ),
    );

    setSelectedClasses(updatedSelectedClasses);
    return false; // Indicates that cancellation should stop
  }

  return true; // Indicates that cancellation can proceed
};

// Determine the redirect path based on user type
export const getLoginPath = (type: UserType): string => {
  switch (type) {
    case "admin":
      return "/admins/login";
    case "instructor":
      return "/instructors/login";
    case "customer":
      return "/customers/login";
    default:
      throw new Error(`Unknown user type: ${type}`);
  }
};

// Get the forgot password path based on user type
export const getForgotPasswordPath = (type: UserType): string => {
  switch (type) {
    case "admin":
      return "/auth/forgot-password?type=admin";
    case "instructor":
      return "/auth/forgot-password?type=instructor";
    case "customer":
      return "/auth/forgot-password?type=customer";
    default:
      throw new Error(`Unknown user type: ${type}`);
  }
};

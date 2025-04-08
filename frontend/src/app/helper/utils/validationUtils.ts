import { revalidateUpcomingClasses } from "@/app/actions/revalidate";
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

// Function to check if the values entered in the registration form are valid
export const isValidRegister = ({
  name,
  email,
  password,
  passConfirmation,
}: RegisterProps) => {
  // If the values are null, return false.
  if (!name || !email || !password || !passConfirmation) {
    return { isValid: false, message: "Please enter your email and password." };
  }

  // TODO: Check if the number of characters in the name is less than XX, return false.

  // If the email is not in the correct format, return false.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  // TODO: Check if the number of characters in the password is less than XX, return false.

  // If values of password and password confirmation is different, return false.
  if (password !== passConfirmation) {
    return { isValid: false, message: "Passwords do not match." };
  }

  return { isValid: true };
};

// Function to check if the values entered in the login form are valid
export const isValidLogin = ({ email, password }: LoginProps) => {
  // If the values are null, return false.
  if (!email || !password) {
    return { isValid: false, message: "Please enter your email and password." };
  }

  // If the email is not in the correct format, return false.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  return { isValid: true };
};

export const validateCancelableClasses = (
  selectedClasses: ClassInfoList,
  setSelectedClasses: SetClassInfoList,
): boolean => {
  const pastPrevDayClasses = selectedClasses.filter((eachClass) =>
    isPastPreviousDayDeadline(eachClass.classDateTime),
  );

  if (pastPrevDayClasses.length > 0) {
    // TODO: Determine the language (jp or en) for the error message based on context.
    alert(CANCELATION_NOT_ALLOWED_MESSAGE.en);

    const updatedSelectedClasses = selectedClasses.filter(
      (eachClass) =>
        !pastPrevDayClasses.some(
          (pastClass) => pastClass.classId === eachClass.classId,
        ),
    );

    revalidateUpcomingClasses();
    setSelectedClasses(updatedSelectedClasses);
    return false; // Indicates that cancellation should stop
  }

  return true; // Indicates that cancellation can proceed
};

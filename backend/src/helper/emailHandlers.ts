import {
  deleteVerificationToken,
  generateVerificationToken,
} from "../services/verificationTokensService";
import { sendVerificationEmail, UserType } from "./mail";

export const sendVerificationEmailHandler = async (
  email: string,
  name: string,
  userType: UserType,
  contextLabel: string,
): Promise<boolean> => {
  try {
    const verificationToken = await generateVerificationToken(email);

    const sendResult = await sendVerificationEmail(
      verificationToken.email,
      name,
      verificationToken.token,
      userType,
    );

    if (!sendResult.success) {
      await deleteVerificationToken(email);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Email verification step failed during ${contextLabel}`, {
      error,
      context: {
        email,
        time: new Date().toISOString(),
      },
    });
    return false;
  }
};

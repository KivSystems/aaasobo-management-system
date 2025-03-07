import { validate as isUUID } from "uuid";

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getCustomerByEmail,
  updateCustomerPassword,
  verifyCustomerEmail,
} from "../services/customersService";
import {
  getInstructorByEmail,
  updateInstructorPassword,
  verifyInstructorEmail,
} from "../services/instructorsService";
import {
  generateVerificationToken,
  getVerificationTokenByToken,
} from "../services/verificationTokenService";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  UserType,
} from "../helper/mail";
import {
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
} from "../services/passwordResetTokensService";

const getUserByEmail = async (userType: UserType, email: string) => {
  if (userType === "customer") {
    return getCustomerByEmail(email);
  }
  if (userType === "instructor") {
    return getInstructorByEmail(email);
  }

  console.warn(`Invalid userType received: ${userType}`);
  return null;
};

export const authenticateUserController = async (
  req: Request,
  res: Response,
) => {
  const { email, password, userType } = req.body;

  try {
    const user = await getUserByEmail(userType, email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      const verificationToken = await generateVerificationToken(user.email);
      const sendResult = await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        userType,
      );
      if (!sendResult.success) {
        throw new Error(
          "Failed to send the confirmation email. Try again later.",
        );
      }
      return res.status(403).json({
        message:
          "Your email address is not verified. We have resent the verification link via email.",
      });
    }

    res.status(200).json({ id: user.id });
  } catch (error) {
    console.error("Authentication error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Invalid email or password";
    res.status(500).json({ message: errorMessage });
  }
};

const EMAIL_VERIFICATION_SUCCESS_MESSAGE =
  "Your email address has been verified. Please log in from the login page.";

export const verifyUserEmailController = async (
  req: Request,
  res: Response,
) => {
  const { token, userType } = req.body;

  if (!token || typeof token !== "string" || !isUUID(token)) {
    return res.status(400).json({ error: "Invalid token." });
  }

  if (!userType || !["customer", "instructor"].includes(userType)) {
    return res.status(400).json({ error: "Invalid user type." });
  }

  try {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
      return res.status(404).json({ error: "Token not found." });
    }

    const existingUser = await getUserByEmail(userType, existingToken.email);

    if (!existingUser) {
      return res.status(404).json({
        error: "The email address does not exist.",
      });
    }

    // This is for cases where a user who has already been verified clicks the email link again.
    if (existingUser.emailVerified) {
      return res
        .status(200)
        .json({ success: EMAIL_VERIFICATION_SUCCESS_MESSAGE });
    }

    const isTokenExpired = new Date(existingToken.expires) < new Date();

    if (isTokenExpired) {
      return res.status(400).json({
        error:
          "The token has expired. Please log in using the link below to request a new one.",
      });
    }

    if (userType === "customer") {
      await verifyCustomerEmail(existingUser.id, existingToken.email);
    } else if (userType === "instructor") {
      await verifyInstructorEmail(existingUser.id, existingToken.email);
    }

    return res
      .status(200)
      .json({ success: EMAIL_VERIFICATION_SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Error verifying user email:", error);
    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};

const PASSWORD_RESET_EMAIL_SUCCESS =
  "We have sent a 'Password Reset Notification' to your registered email address.";

const PASSWORD_RESET_EMAIL_ERROR =
  "Something went wrong. Please try again later.";

export const sendUserResetEmailController = async (
  req: Request,
  res: Response,
) => {
  const { email, userType } = req.body;

  try {
    const user = await getUserByEmail(userType, email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "The email address does not exist." });
    }

    const passwordResetToken = await generatePasswordResetToken(user.email);
    const sendResult = await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
      userType,
    );

    if (!sendResult.success) {
      throw new Error(
        "Email service failure: Failed to send password reset email using Resend.",
      );
    }

    res.status(201).json({ message: PASSWORD_RESET_EMAIL_SUCCESS });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: PASSWORD_RESET_EMAIL_ERROR });
  }
};

const PASSWORD_UPDATE_SUCCESS =
  "Your password has been successfully updated. Please log in using the link below.";
const PASSWORD_UPDATE_ERROR = "An error has occurred. Please try again later.";

export const updatePasswordController = async (req: Request, res: Response) => {
  const { token, userType, password } = req.body;

  try {
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) {
      return res.status(404).json({ message: "Token not found." });
    }

    const isTokenExpired = new Date(existingToken.expires) < new Date();
    if (isTokenExpired) {
      return res.status(400).json({
        message: "The token has expired.",
      });
    }

    const user = await getUserByEmail(userType, existingToken.email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "The email address does not exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === "customer") {
      updateCustomerPassword(user.id, hashedPassword);
    } else if (userType === "instructor") {
      updateInstructorPassword(user.id, hashedPassword);
    }

    res.status(201).json({ message: PASSWORD_UPDATE_SUCCESS });
  } catch (error) {
    console.error("Error updating user password:", error);
    res.status(500).json({ message: PASSWORD_UPDATE_ERROR });
  }
};

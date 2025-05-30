import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getCustomerByEmail,
  updateCustomerPassword,
} from "../services/customersService";
import {
  getInstructorByEmail,
  updateInstructorPassword,
} from "../services/instructorsService";
import {
  deleteVerificationToken,
  generateVerificationToken,
} from "../services/verificationTokensService";
import {
  resendVerificationEmail,
  sendPasswordResetEmail,
  UserType,
} from "../helper/mail";
import {
  deletePasswordResetToken,
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
} from "../services/passwordResetTokensService";
import { saltRounds } from "../helper/commonUtils";
import { Customer } from "@prisma/client";

const getUserByEmail = async (userType: UserType, email: string) => {
  if (userType === "customer") {
    return getCustomerByEmail(email);
  }
  if (userType === "instructor") {
    return getInstructorByEmail(email);
  }
};

export const authenticateUserController = async (
  req: Request,
  res: Response,
) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.sendStatus(400);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(userType, normalizedEmail);

    if (!user) {
      return res.sendStatus(401);
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return res.sendStatus(401);
    }

    // Email verification is only required for customers.
    if (userType === "customer") {
      const customer = user as Customer;

      // Resend email to verify the registered email address if it is not verified yet.
      if (!customer.emailVerified) {
        const verificationToken = await generateVerificationToken(email);

        const resendResult = await resendVerificationEmail(
          verificationToken.email,
          user.name,
          verificationToken.token,
        );

        if (!resendResult.success) {
          await deleteVerificationToken(email);
          return res.sendStatus(503); // Failed to resend verification email. 503 Service Unavailable
        }

        return res.sendStatus(403); // Email is not verified yet. 403 Forbidden
      }
    }

    res.status(200).json({ id: user.id });
  } catch (error) {
    console.error("Error authenticating user", {
      error,
      context: {
        email: normalizedEmail,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const sendUserResetEmailController = async (
  req: Request,
  res: Response,
) => {
  const { email, userType } = req.body;

  if (!email || !userType) {
    return res.sendStatus(400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(userType, normalizedEmail);

    if (!user) {
      return res.sendStatus(404);
    }

    const passwordResetToken = await generatePasswordResetToken(user.email);

    const sendResult = await sendPasswordResetEmail(
      passwordResetToken.email,
      user.name,
      passwordResetToken.token,
      userType,
    );

    if (!sendResult.success) {
      await deletePasswordResetToken(passwordResetToken.email);
      return res.sendStatus(503); // Failed to send password reset email. 503 Service Unavailable
    }

    return res.sendStatus(201);
  } catch (error) {
    console.error("Error sending password reset email", {
      error,
      context: {
        email: normalizedEmail,
        userType,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

export const updatePasswordController = async (req: Request, res: Response) => {
  const { token, userType, password } = req.body;

  if (!token || !userType || !password) {
    return res.sendStatus(400);
  }

  try {
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) {
      return res.sendStatus(404);
    }

    const user = await getUserByEmail(userType, existingToken.email);
    if (!user) {
      return res.sendStatus(404);
    }

    const isTokenExpired = new Date(existingToken.expires) < new Date();

    if (isTokenExpired) {
      return res.sendStatus(410); // Token is expired. 410 Gone
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (userType === "customer") {
      updateCustomerPassword(user.id, hashedPassword);
    } else if (userType === "instructor") {
      updateInstructorPassword(user.id, hashedPassword);
    }

    return res.sendStatus(201);
  } catch (error) {
    console.error("Error updating password", {
      error,
      context: {
        token,
        userType,
        time: new Date().toISOString(),
      },
    });
    res.sendStatus(500);
  }
};

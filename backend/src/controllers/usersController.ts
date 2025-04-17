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
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationTokenByToken,
} from "../services/verificationTokensService";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  UserType,
} from "../helper/mail";
import {
  deletePasswordResetToken,
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
} from "../services/passwordResetTokensService";
import { saltRounds } from "./adminsController";

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

    // TODO: Remove the 'userType === "customer"' condition if email verification is required for instructors too.
    if (userType === "customer" && !user.emailVerified) {
      try {
        const verificationToken = await generateVerificationToken(user.email);

        const sendResult = await sendVerificationEmail(
          verificationToken.email,
          user.name,
          verificationToken.token,
          userType,
        );

        if (!sendResult.success) {
          await deleteVerificationToken(email);
          return res.sendStatus(503); // Failed to send verification email. 503 Service Unavailable
        }

        return res.sendStatus(403); // Email is not verified yet. 403 Forbidden
      } catch (emailError) {
        console.error(
          "Email verification step failed while registering customer",
          {
            error: emailError,
            context: {
              email: normalizedEmail,
              time: new Date().toISOString(),
            },
          },
        );
        return res.sendStatus(503);
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

export const verifyUserEmailController = async (
  req: Request,
  res: Response,
) => {
  const { token, userType } = req.body;

  if (!token || !userType) {
    return res.sendStatus(400);
  }

  try {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
      return res.sendStatus(404);
    }

    const existingUser = await getUserByEmail(userType, existingToken.email);

    if (!existingUser) {
      return res.sendStatus(404);
    }

    // This is for cases where a user who has already been verified clicks the email link again.
    if (existingUser.emailVerified) {
      return res.sendStatus(200);
    }

    const isTokenExpired = new Date(existingToken.expires) < new Date();

    if (isTokenExpired) {
      return res.sendStatus(410); // 410 Gone
    }

    if (userType === "customer") {
      await verifyCustomerEmail(existingUser.id, existingToken.email);
      // TODO: Remove this section if we decide not to require email verification for instructors
    } else if (userType === "instructor") {
      await verifyInstructorEmail(existingUser.id, existingToken.email);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error verifying user email", {
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

const handlePasswordResetEmail = async (
  email: string,
  name: string,
  userType: UserType,
): Promise<boolean> => {
  try {
    const passwordResetToken = await generatePasswordResetToken(email);

    const sendResult = await sendPasswordResetEmail(
      passwordResetToken.email,
      name,
      passwordResetToken.token,
      userType,
    );

    if (!sendResult.success) {
      await deletePasswordResetToken(passwordResetToken.email);
      return false;
    }

    return true;
  } catch (emailError) {
    console.error("Failed to send email during the password reset process.", {
      error: emailError,
      context: {
        email,
        time: new Date().toISOString(),
      },
    });
    return false;
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

    const emailSent = await handlePasswordResetEmail(
      user.email,
      user.name,
      userType,
    );
    if (!emailSent) {
      return res.sendStatus(503); // Failed to send password reset email. 503 Service Unavailable
    }

    return res.sendStatus(201);
  } catch (error) {
    console.error("Error sending password reset email", {
      error,
      context: {
        email,
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
      const emailSent = await handlePasswordResetEmail(
        existingToken.email,
        user.name,
        userType,
      );
      if (!emailSent) {
        return res.sendStatus(503); // Failed to send password reset email. 503 Service Unavailable
      }
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

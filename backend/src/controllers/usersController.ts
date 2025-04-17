import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getCustomerByEmail,
  verifyCustomerEmail,
} from "../services/customersService";
import {
  getInstructorByEmail,
  verifyInstructorEmail,
} from "../services/instructorsService";
import {
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationTokenByToken,
} from "../services/verificationTokensService";
import { sendVerificationEmail, UserType } from "../helper/mail";

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

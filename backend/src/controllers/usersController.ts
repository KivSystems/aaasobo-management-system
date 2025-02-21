import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getCustomerByEmail } from "../services/customersService";
import { getInstructorByEmail } from "../services/instructorsService";
import { generateVerificationToken } from "../services/verificationTokenService";
import { sendVerificationEmail } from "../helper/mail";

const getUserByEmail = async (userType: string, email: string) => {
  if (userType === "customer") {
    return getCustomerByEmail(email);
  }
  if (userType === "instructor") {
    return getInstructorByEmail(email);
  }
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

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getCustomerByEmail } from "../services/customersService";
import { getInstructorByEmail } from "../services/instructorsService";
import {
  GENERAL_ERROR_MESSAGE,
  LOGIN_FAILED_MESSAGE,
} from "../helper/messages";

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

  if (!email || !password || !userType) {
    return res.status(400).json({ message: GENERAL_ERROR_MESSAGE });
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(userType, normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: LOGIN_FAILED_MESSAGE });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return res.status(401).json({ message: LOGIN_FAILED_MESSAGE });
    }

    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error("User authentication error:", error);
    res.status(500).json({ message: GENERAL_ERROR_MESSAGE });
  }
};

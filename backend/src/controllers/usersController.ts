import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getCustomerByEmail } from "../services/customersService";
import { getInstructorByEmail } from "../services/instructorsService";

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

    res.status(200).json({ id: user.id });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import { Request, Response } from "express";
import { validate as isUUID } from "uuid";
import { getVerificationTokenByToken } from "../services/verificationTokenService";

export const getVerificationTokenByTokenController = async (
  req: Request,
  res: Response,
) => {
  const token = req.params.token;

  if (!token || typeof token !== "string" || !isUUID(token)) {
    return res.status(400).json({ error: "Invalid token format." });
  }

  try {
    const verificationToken = await getVerificationTokenByToken(token);

    if (!verificationToken) {
      return res.status(404).json({ error: "Verification token not found." });
    }

    res.json(verificationToken);
  } catch (error) {
    console.error("Error fetching verification token:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

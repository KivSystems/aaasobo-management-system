import express from "express";
import { getVerificationTokenByTokenController } from "../controllers/verificationTokensController";

export const verificationTokensRouter = express.Router();

// http://localhost:4000/verification-tokens

verificationTokensRouter.get("/:token", getVerificationTokenByTokenController);

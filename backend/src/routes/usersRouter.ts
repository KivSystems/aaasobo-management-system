import express from "express";
import {
  authenticateUserController,
  sendUserResetEmailController,
  updatePasswordController,
  verifyResetTokenController,
} from "../controllers/usersController";

export const usersRouter = express.Router();

// http://localhost:4000/users

usersRouter.post("/authenticate", authenticateUserController);
usersRouter.post("/send-password-reset", sendUserResetEmailController);
usersRouter.post("/verify-reset-token", verifyResetTokenController);
usersRouter.patch("/update-password", updatePasswordController);

import express from "express";
import {
  authenticateUserController,
  sendUserResetEmailController,
  verifyUserEmailController,
} from "../controllers/usersController";

export const usersRouter = express.Router();

// http://localhost:4000/users

usersRouter.post("/authenticate", authenticateUserController);
usersRouter.post("/send-password-reset", sendUserResetEmailController);
usersRouter.patch("/verify-email", verifyUserEmailController);

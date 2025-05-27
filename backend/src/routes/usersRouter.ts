import express from "express";
import {
  authenticateUserController,
  sendUserResetEmailController,
  updatePasswordController,
} from "../controllers/usersController";

export const usersRouter = express.Router();

// http://localhost:4000/users

usersRouter.post("/authenticate", authenticateUserController);
usersRouter.post("/send-password-reset", sendUserResetEmailController);
usersRouter.patch("/update-password", updatePasswordController);

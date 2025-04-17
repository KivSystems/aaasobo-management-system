import express from "express";
import {
  authenticateUserController,
  verifyUserEmailController,
} from "../controllers/usersController";

export const usersRouter = express.Router();

// http://localhost:4000/users

usersRouter.post("/authenticate", authenticateUserController);
usersRouter.patch("/verify-email", verifyUserEmailController);

import express from "express";
import { updateSundayColorController } from "../controllers/schedulesController";

export const jobsRouter = express.Router();

// http://localhost:4000/jobs

jobsRouter.post(
  "/business-schedule/update/sunday-color",
  updateSundayColorController,
);

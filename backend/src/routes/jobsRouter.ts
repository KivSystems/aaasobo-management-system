import express from "express";
import { updateSundayColorController } from "../controllers/schedulesController";
import {
  getSystemStatusController,
  updateSystemStatusController,
} from "../controllers/maintenanceController";

export const jobsRouter = express.Router();

// http://localhost:4000/jobs

jobsRouter.get("/get-system-status", getSystemStatusController);
jobsRouter.post(
  "/business-schedule/update-sunday-color",
  updateSundayColorController,
);
jobsRouter.post("/update-system-status", updateSystemStatusController);

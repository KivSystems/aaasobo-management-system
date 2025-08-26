import express from "express";
import { updateSundayColorController } from "../controllers/schedulesController";
import {
  getSystemStatusController,
  updateSystemStatusController,
} from "../controllers/maintenanceController";
import { maskInstructorsController } from "../controllers/instructorsController";
import { deleteOldClassesController } from "../controllers/classesController";

export const jobsRouter = express.Router();

// http://localhost:4000/jobs

jobsRouter.get("/get-system-status", getSystemStatusController);
jobsRouter.post(
  "/business-schedule/update-sunday-color",
  updateSundayColorController,
);
jobsRouter.patch("/update-system-status", updateSystemStatusController);
jobsRouter.patch("/mask/instructors", maskInstructorsController);
jobsRouter.delete("/delete/old-classes", deleteOldClassesController);

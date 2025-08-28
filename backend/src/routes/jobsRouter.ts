import express from "express";
import { updateSundayColorController } from "../controllers/schedulesController";
import {
  getSystemStatusController,
  updateSystemStatusController,
} from "../controllers/maintenanceController";
import { maskInstructorsController } from "../controllers/instructorsController";
import { deleteOldClassesController } from "../controllers/classesController";
import { verifyCronJobAuthorization } from "../middlewares/auth.middleware";

export const jobsRouter = express.Router();

// http://localhost:4000/jobs

jobsRouter.get("/get-system-status", getSystemStatusController);
jobsRouter.post(
  "/business-schedule/update-sunday-color",
  verifyCronJobAuthorization,
  updateSundayColorController,
);
jobsRouter.patch(
  "/update-system-status",
  verifyCronJobAuthorization,
  updateSystemStatusController,
);
jobsRouter.patch(
  "/mask/instructors",
  verifyCronJobAuthorization,
  maskInstructorsController,
);
jobsRouter.delete(
  "/delete/old-classes",
  verifyCronJobAuthorization,
  deleteOldClassesController,
);

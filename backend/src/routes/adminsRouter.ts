import express from "express";
import {
  registerAdminController,
  registerInstructorController,
  registerPlanController,
  registerEventController,
  updateAdminProfileController,
  updateEventProfileController,
  deleteAdminController,
  deleteEventController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getAllEventsController,
  getClassesWithinPeriodController,
} from "../../src/controllers/adminsController";
import {
  getAllSchedulesController,
  updateBusinessScheduleController,
} from "../../src/controllers/schedulesController";

import { verifyAuthentication } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

export const adminsRouter = express.Router();

// http://localhost:4000/admins

adminsRouter.post(
  "/admin-list/register",
  verifyAuthentication,
  registerAdminController,
);
adminsRouter.patch("/:id", verifyAuthentication, updateAdminProfileController);
adminsRouter.delete(
  "/admin-list/:id",
  verifyAuthentication,
  deleteAdminController,
);
adminsRouter.post(
  "/instructor-list/register",
  upload.single("icon"),
  registerInstructorController,
);
adminsRouter.post(
  "/plan-list/register",
  verifyAuthentication,
  registerPlanController,
);

adminsRouter.post(
  "/event-list/register",
  verifyAuthentication,
  registerEventController,
);
adminsRouter.patch(
  "/event-list/update/:id",
  verifyAuthentication,
  updateEventProfileController,
);
adminsRouter.delete(
  "/event-list/:id",
  verifyAuthentication,
  deleteEventController,
);
adminsRouter.post(
  "/business-schedule/update",
  verifyAuthentication,
  updateBusinessScheduleController,
);
adminsRouter.get("/admin-list", getAllAdminsController);
adminsRouter.get("/admin-list/:id", getAdminController);
adminsRouter.get("/instructor-list", getAllInstructorsController);
adminsRouter.get("/customer-list", getAllCustomersController);
adminsRouter.get("/child-list", getAllChildrenController);
adminsRouter.get("/plan-list", getAllPlansController);
adminsRouter.get("/event-list", getAllEventsController);
adminsRouter.get("/class-list", getClassesWithinPeriodController);
adminsRouter.get("/business-schedule", getAllSchedulesController);

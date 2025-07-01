import express from "express";
import {
  registerAdminController,
  registerInstructorController,
  registerPlanController,
  registerEventController,
  updateAdminProfileController,
  deleteAdminController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getAllEventsController,
  getClassesWithinPeriodController,
} from "../../src/controllers/adminsController";
import { getAllSchedulesController } from "../../src/controllers/schedulesController";

import { verifyAuthentication } from "../middlewares/auth.middleware";

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
  verifyAuthentication,
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
adminsRouter.get("/admin-list", getAllAdminsController);
adminsRouter.get("/admin-list/:id", getAdminController);
adminsRouter.get("/instructor-list", getAllInstructorsController);
adminsRouter.get("/customer-list", getAllCustomersController);
adminsRouter.get("/child-list", getAllChildrenController);
adminsRouter.get("/plan-list", getAllPlansController);
adminsRouter.get("/event-list", getAllEventsController);
adminsRouter.get("/class-list", getClassesWithinPeriodController);
adminsRouter.get("/business-schedule", getAllSchedulesController);

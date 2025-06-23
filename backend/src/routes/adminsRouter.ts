import express from "express";
import {
  registerAdminController,
  registerInstructorController,
  registerPlanController,
  updateAdminProfileController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getClassesWithinPeriodController,
} from "../../src/controllers/adminsController";
import { verifyAuthentication } from "../middlewares/auth.middleware";

export const adminsRouter = express.Router();

// http://localhost:4000/admins

adminsRouter.post(
  "/admin-list/register",
  verifyAuthentication,
  registerAdminController,
);
adminsRouter.patch("/:id", verifyAuthentication, updateAdminProfileController);
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
adminsRouter.get("/admin-list", getAllAdminsController);
adminsRouter.get("/admin-list/:id", getAdminController);
adminsRouter.get("/instructor-list", getAllInstructorsController);
adminsRouter.get("/customer-list", getAllCustomersController);
adminsRouter.get("/child-list", getAllChildrenController);
adminsRouter.get("/plan-list", getAllPlansController);
adminsRouter.get("/class-list", getClassesWithinPeriodController);

import express from "express";
import {
  loginAdminController,
  logoutAdminController,
  registerAdminController,
  registerInstructorController,
  updateAdminProfileController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getClassesWithinPeriodController,
} from "../../src/controllers/adminsController";
import {
  requireAuthentication,
  authenticateAdminSession,
} from "../../src/middlewares/auth.middleware";

export const adminsRouter = express.Router();

// http://localhost:4000/admins

adminsRouter.post("/login", loginAdminController);
adminsRouter.get("/logout", logoutAdminController);
// TODO: add authentication middleware to this route
adminsRouter.post("/register", registerAdminController);
adminsRouter.patch("/:id", updateAdminProfileController);
adminsRouter.get("/authentication", authenticateAdminSession);
// TODO: add authentication middleware to this route
adminsRouter.post("/instructor-list/register", registerInstructorController);
adminsRouter.get("/admin-list", getAllAdminsController);
adminsRouter.get("/admin-list/:id", getAdminController);
adminsRouter.get("/instructor-list", getAllInstructorsController);
adminsRouter.get("/customer-list", getAllCustomersController);
adminsRouter.get("/child-list", getAllChildrenController);
adminsRouter.get("/plan-list", getAllPlansController);
adminsRouter.get("/class-list", getClassesWithinPeriodController);

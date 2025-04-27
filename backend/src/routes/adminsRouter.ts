import express from "express";
import {
  loginAdminController,
  logoutAdminController,
  registerAdminController,
  registerInstructorController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getAllClassesController,
} from "../../src/controllers/adminsController";
import {
  requireAuthentication,
  authenticateAdminSession,
} from "../../src/middlewares/auth.middleware";

export const adminsRouter = express.Router();

// http://localhost:4000/admins

adminsRouter.post("/login", loginAdminController);
adminsRouter.get("/logout", logoutAdminController);
adminsRouter.post("/register", requireAuthentication, registerAdminController);
adminsRouter.get("/authentication", authenticateAdminSession);
adminsRouter.post(
  "/instructor-list/register",
  requireAuthentication,
  registerInstructorController,
);
adminsRouter.get("/admin-list/:id", getAdminController);
adminsRouter.get("/admin-list", getAllAdminsController);
adminsRouter.get("/instructor-list", getAllInstructorsController);
adminsRouter.get("/customer-list", getAllCustomersController);
adminsRouter.get("/child-list", getAllChildrenController);
adminsRouter.get("/plan-list", getAllPlansController);
adminsRouter.get("/class-list", getAllClassesController);

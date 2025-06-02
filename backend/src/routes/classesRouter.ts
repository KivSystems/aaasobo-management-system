import express from "express";
import {
  cancelClassController,
  cancelClassesController,
  checkChildrenAvailabilityController,
  checkDoubleBookingController,
  createClassController,
  createClassesForMonthController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByCustomerIdController,
  updateClassController,
} from "../../src/controllers/classesController";

export const classesRouter = express.Router();

// http://localhost:4000/classes

classesRouter.get("/", getAllClassesController);
classesRouter.get("/:id", getClassesByCustomerIdController);
classesRouter.get("/class/:id", getClassByIdController);

classesRouter.post("/create-classes", createClassesForMonthController);
classesRouter.post("/", createClassController);
classesRouter.post("/check-double-booking", checkDoubleBookingController);
classesRouter.post(
  "/check-children-availability",
  checkChildrenAvailabilityController,
);
classesRouter.post("/cancel-classes", cancelClassesController);

classesRouter.delete("/:id", deleteClassController);

classesRouter.patch("/:id", updateClassController);
classesRouter.patch("/:id/cancel", cancelClassController);

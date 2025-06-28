import express from "express";
import {
  cancelClassController,
  cancelClassesController,
  checkChildConflictsController,
  checkDoubleBookingController,
  createClassesForMonthController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByCustomerIdController,
  rebookClassController,
  updateClassController,
} from "../../src/controllers/classesController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";
import { getInstructorAvailabilitiesController } from "../controllers/instructorsAvailabilityController";

export const classesRouter = express.Router();

// http://localhost:4000/classes

classesRouter.get("/", getAllClassesController);
classesRouter.get("/:id", getClassesByCustomerIdController);
classesRouter.get("/:id/instructor-availabilities", parseId, (req, res) =>
  getInstructorAvailabilitiesController(req as RequestWithId, res),
);

classesRouter.get("/class/:id", getClassByIdController);

classesRouter.post("/:id/rebook", parseId, (req, res) =>
  rebookClassController(req as RequestWithId, res),
);
classesRouter.post("/create-classes", createClassesForMonthController);
classesRouter.post("/check-double-booking", checkDoubleBookingController);
classesRouter.post("/check-child-conflicts", checkChildConflictsController);
classesRouter.post("/cancel-classes", cancelClassesController);

classesRouter.delete("/:id", deleteClassController);

classesRouter.patch("/:id", updateClassController);
classesRouter.patch("/:id/cancel", cancelClassController);

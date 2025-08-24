import express from "express";
import {
  cancelClassController,
  cancelClassesController,
  checkChildConflictsController,
  checkDoubleBookingController,
  createClassesForMonthController,
  deleteClassController,
  getAllClassesController,
  getClassesByCustomerIdController,
  rebookClassController,
  updateAttendanceController,
  updateClassStatusController,
} from "../../src/controllers/classesController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";

export const classesRouter = express.Router();

// http://localhost:4000/classes

classesRouter.get("/", getAllClassesController);
classesRouter.get("/:id", getClassesByCustomerIdController);

classesRouter.post("/:id/rebook", parseId, (req, res) =>
  rebookClassController(req as RequestWithId, res),
);
classesRouter.post("/:id/attendance", parseId, (req, res) =>
  updateAttendanceController(req as RequestWithId, res),
);
classesRouter.post("/create-classes", createClassesForMonthController);
classesRouter.post("/check-double-booking", checkDoubleBookingController);
classesRouter.post("/check-child-conflicts", checkChildConflictsController);
classesRouter.post("/cancel-classes", cancelClassesController);

classesRouter.delete("/:id", deleteClassController);

classesRouter.patch("/:id/cancel", cancelClassController);
classesRouter.patch("/:id/status", parseId, (req, res) =>
  updateClassStatusController(req as RequestWithId, res),
);

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
  getClassesForInstructorCalendar,
  nonRebookableCancelController,
  updateClassController,
} from "../../src/controllers/classesController";

export const classesRouter = express.Router();

// http://localhost:4000/classes

classesRouter.get("/", getAllClassesController);
classesRouter.get("/:id", getClassesByCustomerIdController);
classesRouter.get("/class/:id", getClassByIdController);

// TODO: Delete the route below after finishing refactoring the instructor calendar page
classesRouter.get(
  "/calendar/instructor/:instructorId",
  getClassesForInstructorCalendar,
);
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
classesRouter.patch(
  "/:id/non-rebookable-cancel",
  nonRebookableCancelController,
);

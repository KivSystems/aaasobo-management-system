import express from "express";
import {
  getInstructor,
  getInstructorIdByClassIdController,
  getAllInstructorProfilesController,
  getInstructorProfileController,
  getCalendarClassesController,
  getInstructorProfilesController,
  getSameDateClassesController,
} from "../../src/controllers/instructorsController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";
import { verifyAuthentication } from "../middlewares/auth.middleware";
import {
  getInstructorSchedulesController,
  getInstructorScheduleController,
  createInstructorScheduleController,
  getInstructorAvailableSlotsController,
  getAllAvailableSlotsController,
  getActiveInstructorScheduleController,
} from "../../src/controllers/instructorScheduleController";
import {
  getInstructorAbsencesController,
  addInstructorAbsenceController,
  removeInstructorAbsenceController,
} from "../../src/controllers/instructorAbsenceController";

export const instructorsRouter = express.Router();

// http://localhost:4000/instructors

instructorsRouter.get("/available-slots", getAllAvailableSlotsController);
instructorsRouter.get("/class/:id", getInstructorIdByClassIdController);
instructorsRouter.get("/profiles", getInstructorProfilesController);
instructorsRouter.get(
  "/all-profiles",
  verifyAuthentication,
  getAllInstructorProfilesController,
);
instructorsRouter.get("/:id", getInstructor);
instructorsRouter.get("/:id/profile", parseId, (req, res) =>
  getInstructorProfileController(req as RequestWithId, res),
);

instructorsRouter.get(
  "/:id/classes/:classId/same-date",
  parseId,
  (req, res) => {
    getSameDateClassesController(req as RequestWithId, res);
  },
);

instructorsRouter.get("/:id/calendar-classes", parseId, (req, res) => {
  getCalendarClassesController(req as RequestWithId, res);
});

// Instructor schedule system routes
instructorsRouter.get("/:id/schedules", parseId, (req, res) => {
  getInstructorSchedulesController(req as RequestWithId, res);
});

instructorsRouter.get("/:id/schedules/active", parseId, (req, res) => {
  getActiveInstructorScheduleController(req as RequestWithId, res);
});

instructorsRouter.get("/:id/schedules/:scheduleId", parseId, (req, res) => {
  getInstructorScheduleController(req as RequestWithId, res);
});

instructorsRouter.post(
  "/:id/schedules",
  parseId,
  verifyAuthentication,
  (req, res) => {
    createInstructorScheduleController(req as RequestWithId, res);
  },
);

instructorsRouter.get("/:id/available-slots", parseId, (req, res) => {
  getInstructorAvailableSlotsController(req as RequestWithId, res);
});

// Instructor absence routes
instructorsRouter.get("/:id/absences", parseId, (req, res) => {
  getInstructorAbsencesController(req as RequestWithId, res);
});

instructorsRouter.post(
  "/:id/absences",
  parseId,
  verifyAuthentication,
  (req, res) => {
    addInstructorAbsenceController(req as RequestWithId, res);
  },
);

instructorsRouter.delete(
  "/:id/absences/:absentAt",
  parseId,
  verifyAuthentication,
  (req, res) => {
    removeInstructorAbsenceController(req as RequestWithId, res);
  },
);

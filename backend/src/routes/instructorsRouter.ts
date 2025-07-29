import express from "express";
import {
  getAllInstructorsAvailabilitiesController,
  getInstructor,
  addAvailability,
  deleteAvailability,
  RecurringAvailability,
  getInstructorAvailabilities,
  getAllInstructorsController,
  getRecurringAvailabilityById,
  getInstructorProfileController,
  updateInstructorProfile,
  getCalendarClassesController,
  getInstructorProfilesController,
  getSameDateClassesController,
  updateInstructorProfileWithIcon,
} from "../../src/controllers/instructorsController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";
import { verifyAuthentication } from "../middlewares/auth.middleware";
import {
  createInstructorUnavailability,
  getInstructorUnavailabilities,
} from "../../src/controllers/instructorsUnavailabilityController";
import { getCalendarAvailabilitiesController } from "../../src/controllers/instructorsAvailabilityController";
import {
  getInstructorSchedulesController,
  getInstructorScheduleController,
  createInstructorScheduleController,
  getInstructorAvailableSlotsController,
} from "../../src/controllers/instructorScheduleController";
import {
  getInstructorAbsencesController,
  addInstructorAbsenceController,
  removeInstructorAbsenceController,
} from "../../src/controllers/instructorAbsenceController";
import upload from "../middlewares/upload.middleware";

export const instructorsRouter = express.Router();

// http://localhost:4000/instructors

instructorsRouter.get("/", getAllInstructorsAvailabilitiesController);
instructorsRouter.get("/profiles", getInstructorProfilesController);
instructorsRouter.get("/:id", getInstructor);
instructorsRouter.get("/:id/profile", parseId, (req, res) =>
  getInstructorProfileController(req as RequestWithId, res),
);
instructorsRouter.patch("/:id", updateInstructorProfile);
instructorsRouter.patch(
  "/:id/withIcon",
  upload.single("icon"),
  updateInstructorProfileWithIcon,
);
instructorsRouter.get("/:id/recurringAvailability", parseId, (req, res) =>
  RecurringAvailability.get(req as RequestWithId, res),
);
instructorsRouter.put("/:id/recurringAvailability", parseId, (req, res) =>
  RecurringAvailability.put(req as RequestWithId, res),
);
instructorsRouter.put("/:id/availability", parseId, (req, res) =>
  addAvailability(req as RequestWithId, res),
);
instructorsRouter.delete("/:id/availability", parseId, (req, res) =>
  deleteAvailability(req as RequestWithId, res),
);

instructorsRouter.get("/:id/unavailability", parseId, (req, res) => {
  getInstructorUnavailabilities(req as RequestWithId, res);
});
instructorsRouter.put("/:id/unavailability", parseId, (req, res) => {
  createInstructorUnavailability(req as RequestWithId, res);
});

instructorsRouter.get("/:id/availability", parseId, (req, res) => {
  getInstructorAvailabilities(req as RequestWithId, res);
});
instructorsRouter.get("/:id/recurringAvailabilityById", parseId, (req, res) =>
  getRecurringAvailabilityById(req as RequestWithId, res),
);
instructorsRouter.get("/", getAllInstructorsController);

instructorsRouter.get(
  "/:id/classes/:classId/same-date",
  parseId,
  (req, res) => {
    getSameDateClassesController(req as RequestWithId, res);
  },
);

instructorsRouter.get("/:id/calendar-availabilities", parseId, (req, res) => {
  getCalendarAvailabilitiesController(req as RequestWithId, res);
});

instructorsRouter.get("/:id/calendar-classes", parseId, (req, res) => {
  getCalendarClassesController(req as RequestWithId, res);
});

// Instructor schedule system routes (WIP)
instructorsRouter.get("/:id/schedules", parseId, (req, res) => {
  getInstructorSchedulesController(req as RequestWithId, res);
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

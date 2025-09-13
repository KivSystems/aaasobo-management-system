import express, { RequestHandler } from "express";
import {
  getInstructor,
  getInstructorIdByClassIdController,
  getAllInstructorProfilesController,
  getInstructorProfileController,
  getCalendarClassesController,
  getInstructorProfilesController,
  getSameDateClassesController,
} from "../../src/controllers/instructorsController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { MessageErrorResponse, ErrorResponse } from "@shared/schemas/common";
import {
  InstructorProfilesResponse,
  AllInstructorProfilesResponse,
  InstructorIdParams,
  InstructorResponse,
  SimpleInstructorProfile,
  InstructorSchedulesResponse,
  ClassIdParams,
  ClassInstructorResponse,
  AvailableSlotsQuery,
  AvailableSlotsResponse,
  InstructorClassParams,
} from "@shared/schemas/instructors";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";
import { verifyAuthentication } from "../middlewares/auth.middleware";
import {
  getInstructorSchedulesController,
  getInstructorScheduleController,
  createInstructorScheduleController,
  createInstructorPostTerminationScheduleController,
  getInstructorAvailableSlotsController,
  getAllAvailableSlotsController,
  getActiveInstructorScheduleController,
} from "../../src/controllers/instructorScheduleController";
import {
  getInstructorAbsencesController,
  addInstructorAbsenceController,
  removeInstructorAbsenceController,
} from "../../src/controllers/instructorAbsenceController";

const profilesConfig = {
  method: "get" as const,
  handler: getInstructorProfilesController,
  openapi: {
    summary: "Get instructor profiles",
    description: "Get public instructor profiles for customer dashboard",
    responses: {
      200: {
        description: "Successfully retrieved instructor profiles",
        schema: InstructorProfilesResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const allProfilesConfig = {
  method: "get" as const,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: getAllInstructorProfilesController,
  openapi: {
    summary: "Get all instructor profiles",
    description:
      "Get detailed instructor profiles for authenticated admin users",
    responses: {
      200: {
        description: "Successfully retrieved detailed instructor profiles",
        schema: AllInstructorProfilesResponse,
      },
      401: {
        description: "Unauthorized - authentication required",
        schema: MessageErrorResponse,
      },
      404: {
        description: "Instructors not found",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const instructorByIdConfig = {
  method: "get" as const,
  paramsSchema: InstructorIdParams,
  handler: getInstructor,
  openapi: {
    summary: "Get instructor by ID",
    description: "Get detailed instructor information by ID",
    responses: {
      200: {
        description: "Successfully retrieved instructor details",
        schema: InstructorResponse,
      },
      400: {
        description: "Invalid instructor ID parameter",
        schema: MessageErrorResponse,
      },
      404: {
        description: "Instructor not found",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const instructorProfileConfig = {
  method: "get" as const,
  paramsSchema: InstructorIdParams,
  handler: getInstructorProfileController,
  openapi: {
    summary: "Get simple instructor profile",
    description: "Get basic instructor profile information by ID",
    responses: {
      200: {
        description: "Successfully retrieved instructor profile",
        schema: SimpleInstructorProfile,
      },
      400: {
        description: "Invalid instructor ID parameter",
        schema: MessageErrorResponse,
      },
      404: {
        description: "Instructor not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  },
} as const;

const instructorSchedulesConfig = {
  method: "get" as const,
  paramsSchema: InstructorIdParams,
  handler: getInstructorSchedulesController,
  openapi: {
    summary: "Get instructor schedules",
    description: "Get all schedule versions for an instructor by ID",
    responses: {
      200: {
        description: "Successfully retrieved instructor schedules",
        schema: InstructorSchedulesResponse,
      },
      400: {
        description: "Invalid instructor ID parameter",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const classInstructorConfig = {
  method: "get" as const,
  paramsSchema: ClassIdParams,
  handler: getInstructorIdByClassIdController,
  openapi: {
    summary: "Get instructor ID by class ID",
    description: "Get the instructor ID for a specific class",
    responses: {
      200: {
        description: "Successfully retrieved instructor ID",
        schema: ClassInstructorResponse,
      },
      400: {
        description: "Invalid class ID parameter",
        schema: ErrorResponse,
      },
      404: {
        description: "Class not found",
        schema: ErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const availableSlotsConfig = {
  method: "get" as const,
  querySchema: AvailableSlotsQuery,
  handler: getAllAvailableSlotsController,
  openapi: {
    summary: "Get all available instructor slots",
    description:
      "Get available time slots across all instructors for a date range",
    responses: {
      200: {
        description: "Successfully retrieved available slots",
        schema: AvailableSlotsResponse,
      },
      400: {
        description: "Invalid query parameters",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const sameDateClassesConfig = {
  method: "get" as const,
  paramsSchema: InstructorClassParams,
  handler: getSameDateClassesController,
  openapi: {
    summary: "Get same-date classes",
    description:
      "Get classes on the same date for a specific instructor and class",
    responses: {
      200: {
        description: "Successfully retrieved same-date classes",
        // Using any schema for now since the response is complex class data
      },
      400: {
        description: "Invalid instructor ID or class ID",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
      },
    },
  },
} as const;

const calendarClassesConfig = {
  method: "get" as const,
  paramsSchema: InstructorIdParams,
  handler: getCalendarClassesController,
  openapi: {
    summary: "Get instructor calendar classes",
    description: "Get calendar classes for an instructor",
    responses: {
      200: {
        description: "Successfully retrieved calendar classes",
        // Using any schema for now since the response is complex class data
      },
      400: {
        description: "Invalid instructor ID",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
      },
    },
  },
} as const;

const validatedRouteConfigs = {
  "/profiles": profilesConfig,
  "/all-profiles": allProfilesConfig,
  "/available-slots": availableSlotsConfig,
  "/:id/classes/:classId/same-date": sameDateClassesConfig,
  "/:id/calendar-classes": calendarClassesConfig,
  "/:id": instructorByIdConfig,
  "/:id/profile": instructorProfileConfig,
  "/:id/schedules": instructorSchedulesConfig,
  "/class/:id": classInstructorConfig,
} as const;

export const instructorsRouter = express.Router();

// http://localhost:4000/instructors

// Register validated routes (includes all routes with validation)
registerRoutes(instructorsRouter, validatedRouteConfigs);

export { validatedRouteConfigs as instructorsRouterConfig };

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

instructorsRouter.post(
  "/schedules/post-termination",
  createInstructorPostTerminationScheduleController,
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

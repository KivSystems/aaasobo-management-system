import express, { RequestHandler } from "express";
import {
  registerAdminController,
  registerInstructorController,
  registerPlanController,
  registerEventController,
  updateAdminProfileController,
  updateInstructorProfileController,
  updateEventProfileController,
  updatePlanController,
  deleteAdminController,
  deactivateCustomerController,
  deleteEventController,
  getAdminController,
  getAllAdminsController,
  getAllInstructorsController,
  getAllCustomersController,
  getAllChildrenController,
  getAllPlansController,
  getAllSubscriptionsController,
  getAllEventsController,
  getClassesWithinPeriodController,
} from "../../src/controllers/adminsController";
import {
  getAllSchedulesController,
  updateBusinessScheduleController,
} from "../../src/controllers/schedulesController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { MessageErrorResponse, ErrorResponse } from "@shared/schemas/common";
import {
  AdminIdParams,
  CustomerIdParams,
  InstructorIdParams,
  PlanIdParams,
  EventIdParams,
  RegisterAdminRequest,
  UpdateAdminRequest,
  RegisterInstructorRequest,
  UpdateInstructorRequest,
  RegisterPlanRequest,
  UpdatePlanRequest,
  RegisterEventRequest,
  UpdateEventRequest,
  UpdateBusinessScheduleRequest,
  AdminResponse,
  AdminsListResponse,
  InstructorsListResponse,
  CustomersListResponse,
  ChildrenListResponse,
  PlansListResponse,
  SubscriptionsListResponse,
  EventsListResponse,
  ClassesListResponse,
  SchedulesListResponse,
  UpdateAdminResponse,
  UpdateInstructorResponse,
  UpdatePlanResponse,
  UpdateEventResponse,
  DeleteResponse,
  ValidationErrorResponse,
  ConflictErrorResponse,
  InstructorUpdateErrorResponse,
} from "@shared/schemas/admins";

import { verifyAuthentication } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

// Route configurations
const registerAdminConfig = {
  method: "post" as const,
  bodySchema: RegisterAdminRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: registerAdminController,
  openapi: {
    summary: "Register new admin",
    description: "Register a new admin user",
    responses: {
      201: {
        description: "Admin registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Admin with email already exists",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const updateAdminConfig = {
  method: "patch" as const,
  paramsSchema: AdminIdParams,
  bodySchema: UpdateAdminRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: updateAdminProfileController,
  openapi: {
    summary: "Update admin profile",
    description: "Update admin profile information",
    responses: {
      200: {
        description: "Admin updated successfully",
        schema: UpdateAdminResponse,
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Email already in use",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const deleteAdminConfig = {
  method: "delete" as const,
  paramsSchema: AdminIdParams,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: deleteAdminController,
  openapi: {
    summary: "Delete admin",
    description: "Delete an admin user",
    responses: {
      200: {
        description: "Admin deleted successfully",
        schema: DeleteResponse,
      },
      400: {
        description: "Invalid admin ID",
        schema: ErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAdminConfig = {
  method: "get" as const,
  paramsSchema: AdminIdParams,
  handler: getAdminController,
  openapi: {
    summary: "Get admin by ID",
    description: "Get admin details by ID",
    responses: {
      200: {
        description: "Admin details retrieved successfully",
        schema: AdminResponse,
      },
      400: {
        description: "Invalid admin ID",
        schema: MessageErrorResponse,
      },
      404: {
        description: "Admin not found",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const getAllAdminsConfig = {
  method: "get" as const,
  handler: getAllAdminsController,
  openapi: {
    summary: "Get all admins",
    description: "Get list of all admin users",
    responses: {
      200: {
        description: "Admins list retrieved successfully",
        schema: AdminsListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const registerInstructorConfig = {
  method: "post" as const,
  bodySchema: RegisterInstructorRequest,
  middleware: [verifyAuthentication, upload.none()] as RequestHandler[],
  handler: registerInstructorController,
  openapi: {
    summary: "Register new instructor",
    description: "Register a new instructor",
    responses: {
      201: {
        description: "Instructor registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Conflict with existing data",
        schema: ConflictErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const registerInstructorWithIconConfig = {
  method: "post" as const,
  bodySchema: RegisterInstructorRequest,
  middleware: [verifyAuthentication, upload.single("icon")] as RequestHandler[],
  handler: registerInstructorController,
  openapi: {
    summary: "Register new instructor with icon",
    description: "Register a new instructor with profile icon",
    responses: {
      201: {
        description: "Instructor registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Conflict with existing data",
        schema: ConflictErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const updateInstructorConfig = {
  method: "patch" as const,
  paramsSchema: InstructorIdParams,
  bodySchema: UpdateInstructorRequest,
  middleware: [verifyAuthentication, upload.none()] as RequestHandler[],
  handler: updateInstructorProfileController,
  openapi: {
    summary: "Update instructor profile",
    description: "Update instructor profile information",
    responses: {
      200: {
        description: "Instructor updated successfully",
        schema: UpdateInstructorResponse,
      },
      400: {
        description: "Invalid request data",
        schema: InstructorUpdateErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const updateInstructorWithIconConfig = {
  method: "patch" as const,
  paramsSchema: InstructorIdParams,
  bodySchema: UpdateInstructorRequest,
  middleware: [verifyAuthentication, upload.single("icon")] as RequestHandler[],
  handler: updateInstructorProfileController,
  openapi: {
    summary: "Update instructor profile with icon",
    description: "Update instructor profile information with profile icon",
    responses: {
      200: {
        description: "Instructor updated successfully",
        schema: UpdateInstructorResponse,
      },
      400: {
        description: "Invalid request data",
        schema: InstructorUpdateErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllInstructorsConfig = {
  method: "get" as const,
  handler: getAllInstructorsController,
  openapi: {
    summary: "Get all instructors",
    description: "Get list of all instructors for admin dashboard",
    responses: {
      200: {
        description: "Instructors list retrieved successfully",
        schema: InstructorsListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllCustomersConfig = {
  method: "get" as const,
  handler: getAllCustomersController,
  openapi: {
    summary: "Get all customers",
    description: "Get list of all customers for admin dashboard",
    responses: {
      200: {
        description: "Customers list retrieved successfully",
        schema: CustomersListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const deactivateCustomerConfig = {
  method: "patch" as const,
  paramsSchema: CustomerIdParams,
  // middleware: [verifyAuthentication] as RequestHandler[],
  handler: deactivateCustomerController,
  openapi: {
    summary: "Deactivate customer",
    description: "Deactivate a customer in the system",
    responses: {
      200: {
        description: "Customer deactivated successfully",
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllChildrenConfig = {
  method: "get" as const,
  handler: getAllChildrenController,
  openapi: {
    summary: "Get all children",
    description: "Get list of all children for admin dashboard",
    responses: {
      200: {
        description: "Children list retrieved successfully",
        schema: ChildrenListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const registerPlanConfig = {
  method: "post" as const,
  bodySchema: RegisterPlanRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: registerPlanController,
  openapi: {
    summary: "Register new plan",
    description: "Register a new subscription plan",
    responses: {
      201: {
        description: "Plan registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const updatePlanConfig = {
  method: "patch" as const,
  paramsSchema: PlanIdParams,
  bodySchema: UpdatePlanRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: updatePlanController,
  openapi: {
    summary: "Update or delete plan",
    description: "Update plan information or mark for deletion",
    responses: {
      200: {
        description: "Plan updated/deleted successfully",
        schema: UpdatePlanResponse,
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllPlansConfig = {
  method: "get" as const,
  handler: getAllPlansController,
  openapi: {
    summary: "Get all plans",
    description: "Get list of all subscription plans",
    responses: {
      200: {
        description: "Plans list retrieved successfully",
        schema: PlansListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllSubscriptionsConfig = {
  method: "get" as const,
  handler: getAllSubscriptionsController,
  openapi: {
    summary: "Get all subscriptions",
    description: "Get list of all active subscriptions",
    responses: {
      200: {
        description: "Subscriptions list retrieved successfully",
        schema: SubscriptionsListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const registerEventConfig = {
  method: "post" as const,
  bodySchema: RegisterEventRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: registerEventController,
  openapi: {
    summary: "Register new event",
    description: "Register a new calendar event",
    responses: {
      201: {
        description: "Event registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Event name or color already exists",
        schema: ConflictErrorResponse,
      },
      422: {
        description: "Invalid event name format",
        schema: ValidationErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const updateEventConfig = {
  method: "patch" as const,
  paramsSchema: EventIdParams,
  bodySchema: UpdateEventRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: updateEventProfileController,
  openapi: {
    summary: "Update event",
    description: "Update event information",
    responses: {
      200: {
        description: "Event updated successfully",
        schema: UpdateEventResponse,
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Event name or color already exists",
        schema: ConflictErrorResponse,
      },
      422: {
        description: "Invalid event name format",
        schema: ValidationErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const deleteEventConfig = {
  method: "delete" as const,
  paramsSchema: EventIdParams,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: deleteEventController,
  openapi: {
    summary: "Delete event",
    description: "Delete a calendar event",
    responses: {
      200: {
        description: "Event deleted successfully",
        schema: DeleteResponse,
      },
      400: {
        description: "Invalid event ID",
        schema: ErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllEventsConfig = {
  method: "get" as const,
  handler: getAllEventsController,
  openapi: {
    summary: "Get all events",
    description: "Get list of all calendar events",
    responses: {
      200: {
        description: "Events list retrieved successfully",
        schema: EventsListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getClassesWithinPeriodConfig = {
  method: "get" as const,
  handler: getClassesWithinPeriodController,
  openapi: {
    summary: "Get classes within period",
    description: "Get classes within a 31-day period for admin dashboard",
    responses: {
      200: {
        description: "Classes list retrieved successfully",
        schema: ClassesListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const updateBusinessScheduleConfig = {
  method: "post" as const,
  bodySchema: UpdateBusinessScheduleRequest,
  middleware: [verifyAuthentication] as RequestHandler[],
  handler: updateBusinessScheduleController,
  openapi: {
    summary: "Update business schedule",
    description: "Update business operation schedule",
    responses: {
      200: {
        description: "Business schedule updated successfully",
      },
      400: {
        description: "Invalid request data",
        schema: ErrorResponse,
      },
      401: {
        description: "Unauthorized",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const getAllSchedulesConfig = {
  method: "get" as const,
  handler: getAllSchedulesController,
  openapi: {
    summary: "Get all schedules",
    description: "Get all business schedules",
    responses: {
      200: {
        description: "Schedules retrieved successfully",
        schema: SchedulesListResponse,
      },
      500: {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const validatedRouteConfigs = {
  "/admin-list/register": [registerAdminConfig],
  "/:id": [updateAdminConfig],
  "/admin-list": [getAllAdminsConfig],
  "/admin-list/:id": [deleteAdminConfig, getAdminConfig],
  "/instructor-list/register": [registerInstructorConfig],
  "/instructor-list/register/withIcon": [registerInstructorWithIconConfig],
  "/instructor-list/update/:id": [updateInstructorConfig],
  "/instructor-list/update/:id/withIcon": [updateInstructorWithIconConfig],
  "/instructor-list": [getAllInstructorsConfig],
  "/customer-list": [getAllCustomersConfig],
  "/customer-list/deactivate/:id": [deactivateCustomerConfig],
  "/child-list": [getAllChildrenConfig],
  "/plan-list/register": [registerPlanConfig],
  "/plan-list/update/:id": [updatePlanConfig],
  "/plan-list": [getAllPlansConfig],
  "/subscription-list": [getAllSubscriptionsConfig],
  "/event-list/register": [registerEventConfig],
  "/event-list/update/:id": [updateEventConfig],
  "/event-list/:id": [deleteEventConfig],
  "/event-list": [getAllEventsConfig],
  "/class-list": [getClassesWithinPeriodConfig],
  "/business-schedule/update": [updateBusinessScheduleConfig],
  "/business-schedule": [getAllSchedulesConfig],
} as const;

export const adminsRouter = express.Router();

// http://localhost:4000/admins

registerRoutes(adminsRouter, validatedRouteConfigs);

export { validatedRouteConfigs as adminsRouterConfig };

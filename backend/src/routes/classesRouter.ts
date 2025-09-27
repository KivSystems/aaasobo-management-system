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
import { registerRoutes } from "../middlewares/validationMiddleware";
import { RouteConfig } from "../openapi/routerRegistry";
import {
  ClassIdParams,
  RebookClassRequest,
  CreateClassesForMonthRequest,
  CheckDoubleBookingRequest,
  CheckChildConflictsRequest,
  CancelClassesRequest,
  UpdateAttendanceRequest,
  UpdateClassStatusRequest,
  AllClassesResponse,
  ClassesByCustomerResponse,
  CreateClassesResponse,
  CheckDoubleBookingResponse,
  CheckChildConflictsResponse,
  DeleteClassResponse,
  RebookClassErrorResponse,
  ValidationErrorResponse,
} from "@shared/schemas/classes";

export const classesRouter = express.Router();

// Route configurations for validation and OpenAPI
const routeConfigs: Record<string, readonly RouteConfig[]> = {
  "/": [
    {
      method: "get",
      handler: getAllClassesController,
      openapi: {
        summary: "Get all classes",
        description:
          "Retrieve all classes with instructor and customer information",
        responses: {
          "200": {
            description: "List of all classes",
            schema: AllClassesResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/:id": [
    {
      method: "get",
      handler: getClassesByCustomerIdController,
      paramsSchema: ClassIdParams,
      openapi: {
        summary: "Get classes by customer ID",
        description: "Retrieve classes for a specific customer",
        responses: {
          "200": {
            description: "Classes for the specified customer",
            schema: ClassesByCustomerResponse,
          },
          "400": {
            description: "Invalid customer ID",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
    {
      method: "delete",
      handler: deleteClassController,
      paramsSchema: ClassIdParams,
      openapi: {
        summary: "Delete a class",
        description: "Delete a specific class by ID",
        responses: {
          "200": {
            description: "Class deleted successfully",
            schema: DeleteClassResponse,
          },
          "400": {
            description: "Invalid class ID",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/:id/rebook": [
    {
      method: "post",
      handler: rebookClassController,
      paramsSchema: ClassIdParams,
      bodySchema: RebookClassRequest,
      openapi: {
        summary: "Rebook a class",
        description:
          "Rebook an existing class to a new date and time with a different instructor",
        responses: {
          "201": {
            description: "Class rebooked successfully",
          },
          "400": {
            description: "Validation error or business logic error",
            schema: RebookClassErrorResponse,
          },
          "403": {
            description: "Past rebooking deadline",
            schema: RebookClassErrorResponse,
          },
          "404": {
            description: "No subscription found",
            schema: RebookClassErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/:id/attendance": [
    {
      method: "post",
      handler: updateAttendanceController,
      paramsSchema: ClassIdParams,
      bodySchema: UpdateAttendanceRequest,
      openapi: {
        summary: "Update class attendance",
        description: "Update the list of children attending a specific class",
        responses: {
          "200": {
            description: "Attendance updated successfully",
          },
          "400": {
            description: "Invalid attendance data",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/:id/cancel": [
    {
      method: "patch",
      handler: cancelClassController,
      paramsSchema: ClassIdParams,
      openapi: {
        summary: "Cancel a class",
        description: "Cancel a specific class by ID",
        responses: {
          "200": {
            description: "Class cancelled successfully",
          },
          "400": {
            description: "Invalid class ID",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/:id/status": [
    {
      method: "patch",
      handler: updateClassStatusController,
      paramsSchema: ClassIdParams,
      bodySchema: UpdateClassStatusRequest,
      openapi: {
        summary: "Update class status",
        description: "Update the status of a specific class",
        responses: {
          "200": {
            description: "Class status updated successfully",
          },
          "400": {
            description: "Invalid request data",
            schema: ValidationErrorResponse,
          },
          "404": {
            description: "Class not found",
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/create-classes": [
    {
      method: "post",
      handler: createClassesForMonthController,
      bodySchema: CreateClassesForMonthRequest,
      openapi: {
        summary: "Create classes for a month",
        description:
          "Generate classes for a specific month based on recurring class schedules",
        responses: {
          "201": {
            description: "Classes created successfully",
            schema: CreateClassesResponse,
          },
          "400": {
            description: "Invalid year or month",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/check-double-booking": [
    {
      method: "post",
      handler: checkDoubleBookingController,
      bodySchema: CheckDoubleBookingRequest,
      openapi: {
        summary: "Check for double booking",
        description:
          "Check if a customer already has a class booked at the specified time",
        responses: {
          "200": {
            description: "Double booking check result",
            schema: CheckDoubleBookingResponse,
          },
          "400": {
            description: "Invalid request data",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/check-child-conflicts": [
    {
      method: "post",
      handler: checkChildConflictsController,
      bodySchema: CheckChildConflictsRequest,
      openapi: {
        summary: "Check for child conflicts",
        description:
          "Check if any of the selected children have conflicts at the specified time",
        responses: {
          "200": {
            description: "Child conflict check result",
            schema: CheckChildConflictsResponse,
          },
          "400": {
            description: "Invalid request data",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
  "/cancel-classes": [
    {
      method: "post",
      handler: cancelClassesController,
      bodySchema: CancelClassesRequest,
      openapi: {
        summary: "Cancel multiple classes",
        description: "Cancel multiple classes by their IDs",
        responses: {
          "200": {
            description: "Classes cancelled successfully",
          },
          "400": {
            description: "Invalid class IDs",
            schema: ValidationErrorResponse,
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  ],
};

// Register routes with validation middleware
registerRoutes(classesRouter, routeConfigs);

// Export route configs for OpenAPI registration
export const validatedRouteConfigs = routeConfigs as Record<
  string,
  readonly RouteConfig[]
>;
export { validatedRouteConfigs as classesRouterConfig };

import express, { RequestHandler } from "express";
import { updateSundayColorController } from "../controllers/schedulesController";
import {
  getSystemStatusController,
  updateSystemStatusController,
} from "../controllers/maintenanceController";
import { maskInstructorsController } from "../controllers/instructorsController";
import { deleteOldClassesController } from "../controllers/classesController";
import { verifyCronJobAuthorization } from "../middlewares/auth.middleware";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { RouteConfig } from "../openapi/routerRegistry";
import {
  UpdateSundayColorRequest,
  SystemStatusResponse,
  UpdateSystemStatusResponse,
  UpdateSundayColorResponse,
  MaskInstructorsResponse,
  DeleteOldClassesResponse,
} from "../../../shared/schemas/jobs";
import { MessageErrorResponse } from "../../../shared/schemas/common";

export const jobsRouter = express.Router();

// http://localhost:4000/jobs

// Define route configurations with Zod schemas
const validatedRouteConfigs = {
  "/get-system-status": [
    {
      method: "get",
      middleware: [verifyCronJobAuthorization],
      handler: getSystemStatusController,
      openapi: {
        summary: "Get system status",
        description:
          "Retrieves the current system status (Running or Stop) from the database",
        responses: {
          "200": {
            description: "System status retrieved successfully",
            schema: SystemStatusResponse,
          },
          "500": {
            description: "Internal server error",
            schema: MessageErrorResponse,
          },
        },
      },
    },
  ] as const,
  "/business-schedule/update-sunday-color": [
    {
      method: "post",
      bodySchema: UpdateSundayColorRequest,
      middleware: [verifyCronJobAuthorization],
      handler: updateSundayColorController,
      openapi: {
        summary: "Update Sunday color for next year",
        description:
          "Updates all Sundays in the next year with the specified event color. This is a scheduled cron job endpoint.",
        responses: {
          "200": {
            description: "Sunday colors updated successfully",
            schema: UpdateSundayColorResponse,
          },
          "400": {
            description: "Invalid event ID",
            schema: MessageErrorResponse,
          },
          "500": {
            description: "Failed to update Sunday colors",
            schema: MessageErrorResponse,
          },
        },
      },
    },
  ] as const,
  "/update-system-status": [
    {
      method: "patch",
      middleware: [verifyCronJobAuthorization],
      handler: updateSystemStatusController,
      openapi: {
        summary: "Toggle system status",
        description:
          "Toggles the system status between Running and Stop. This is a scheduled cron job endpoint.",
        responses: {
          "200": {
            description: "System status updated successfully",
            schema: UpdateSystemStatusResponse,
          },
          "500": {
            description: "Failed to update system status",
            schema: MessageErrorResponse,
          },
        },
      },
    },
  ] as const,
  "/mask/instructors": [
    {
      method: "patch",
      middleware: [verifyCronJobAuthorization],
      handler: maskInstructorsController,
      openapi: {
        summary: "Mask instructors who have left",
        description:
          "Masks personal information of instructors who have left the organization and have not been masked yet. This is a scheduled cron job endpoint.",
        responses: {
          "200": {
            description: "Instructors masked successfully",
            schema: MaskInstructorsResponse,
          },
          "500": {
            description: "Error masking instructors",
            schema: MessageErrorResponse,
          },
        },
      },
    },
  ] as const,
  "/delete/old-classes": [
    {
      method: "delete",
      middleware: [verifyCronJobAuthorization],
      handler: deleteOldClassesController,
      openapi: {
        summary: "Delete old classes",
        description:
          "Deletes classes older than a specified threshold. This is a scheduled cron job endpoint.",
        responses: {
          "200": {
            description: "Old classes deleted successfully",
            schema: DeleteOldClassesResponse,
          },
          "500": {
            description: "Error deleting old classes",
          },
        },
      },
    },
  ] as const,
} satisfies Record<string, readonly RouteConfig[]>;

// Register routes with validation middleware
registerRoutes(jobsRouter, validatedRouteConfigs);

// Export for OpenAPI registration
export { validatedRouteConfigs as jobsRouterConfig };

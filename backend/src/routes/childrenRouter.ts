import express, { RequestHandler } from "express";
import {
  deleteChildController,
  getChildrenController,
  registerChildController,
  updateChildProfileController,
  getChildByIdController,
} from "../../src/controllers/childrenController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { MessageErrorResponse } from "../../../shared/schemas/common";
import {
  ChildIdParams,
  GetChildrenQuery,
  RegisterChildRequest,
  UpdateChildRequest,
  ChildProfile,
  ChildrenResponse,
  UpdateChildResponse,
  DeleteChildResponse,
  DeleteChildConflictResponse,
} from "../../../shared/schemas/children";
import { verifyAuthentication } from "../middlewares/auth.middleware";
import { AUTH_ROLES } from "../helper/commonUtils";

// Route configurations
const getChildrenConfig = {
  method: "get" as const,
  querySchema: GetChildrenQuery,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
  handler: getChildrenController,
  openapi: {
    summary: "Get children by customer ID",
    description: "Retrieve all children for a specific customer",
    responses: {
      200: {
        description: "Children retrieved successfully",
        schema: ChildrenResponse,
      },
      400: {
        description: "Invalid or missing customerId",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const getChildByIdConfig = {
  method: "get" as const,
  paramsSchema: ChildIdParams,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
  handler: getChildByIdController,
  openapi: {
    summary: "Get child by ID",
    description: "Retrieve a specific child by their ID",
    responses: {
      200: {
        description: "Child retrieved successfully",
        schema: ChildProfile,
      },
      400: {
        description: "Invalid child ID",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const registerChildConfig = {
  method: "post" as const,
  bodySchema: RegisterChildRequest,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
  handler: registerChildController,
  openapi: {
    summary: "Register new child",
    description: "Register a new child profile",
    responses: {
      200: {
        description: "Child registered successfully",
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const updateChildConfig = {
  method: "patch" as const,
  paramsSchema: ChildIdParams,
  bodySchema: UpdateChildRequest,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
  handler: updateChildProfileController,
  openapi: {
    summary: "Update child profile",
    description: "Update a child's profile information",
    responses: {
      200: {
        description: "Child updated successfully",
        schema: UpdateChildResponse,
      },
      400: {
        description: "Invalid request data",
        schema: MessageErrorResponse,
      },
      403: {
        description: "Forbidden - child does not belong to customer",
        schema: MessageErrorResponse,
      },
      404: {
        description: "Child not found",
        schema: MessageErrorResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const deleteChildConfig = {
  method: "delete" as const,
  paramsSchema: ChildIdParams,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
  handler: deleteChildController,
  openapi: {
    summary: "Delete child",
    description: "Delete a child profile",
    responses: {
      200: {
        description: "Child deleted successfully",
        schema: DeleteChildResponse,
      },
      400: {
        description: "Invalid child ID",
        schema: MessageErrorResponse,
      },
      409: {
        description: "Cannot delete child - has completed or booked classes",
        schema: DeleteChildConflictResponse,
      },
      500: {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const validatedRouteConfigs = {
  "/": [getChildrenConfig, registerChildConfig],
  "/:id": [getChildByIdConfig, updateChildConfig, deleteChildConfig],
} as const;

export const childrenRouter = express.Router();

// http://localhost:4000/children
registerRoutes(childrenRouter, validatedRouteConfigs);
export { validatedRouteConfigs as childrenRouterConfig };

import express from "express";
import {
  getSubscriptionsByIdController,
  registerCustomerController,
  updateCustomerProfileController,
  registerSubscriptionController,
  getUpcomingClassesController,
  getCustomerByIdController,
  getClassesController,
  getRebookableClassesController,
  verifyCustomerEmailController,
  checkEmailConflictsController,
  getChildProfilesController,
  markWelcomeSeenController,
  declineFreeTrialClassController,
} from "../../src/controllers/customersController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { RouteConfig } from "../openapi/routerRegistry";
import {
  CustomerIdParams,
  RegisterCustomerRequest,
  UpdateCustomerProfileRequest,
  RegisterSubscriptionRequest,
  VerifyEmailRequest,
  CheckEmailConflictsRequest,
  DeclineFreeTrialRequest,
  SubscriptionsResponse,
  CustomerProfileResponse,
  UpdateProfileResponse,
  NewSubscriptionResponse,
  RebookableClassesResponse,
  UpcomingClassesResponse,
  CustomerClassesResponse,
  ChildProfilesResponse,
} from "../../../shared/schemas/customers";
import { ErrorResponse } from "../../../shared/schemas/common";

export const customersRouter = express.Router();

// Individual route configurations
const registerConfig = {
  method: "post" as const,
  handler: registerCustomerController,
  bodySchema: RegisterCustomerRequest,
  openapi: {
    summary: "Register new customer",
    description: "Register a new customer account with child profile",
    responses: {
      "201": { description: "Customer registered successfully" },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "409": { description: "Email already exists" },
      "500": { description: "Internal server error" },
      "503": { description: "Failed to send verification email" },
    },
  },
} as const;

const checkEmailConflictsConfig = {
  method: "post" as const,
  handler: checkEmailConflictsController,
  bodySchema: CheckEmailConflictsRequest,
  openapi: {
    summary: "Check email conflicts",
    description: "Check if email address is already registered",
    responses: {
      "200": { description: "Email is available" },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "409": { description: "Email already exists" },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const verifyEmailConfig = {
  method: "patch" as const,
  handler: verifyCustomerEmailController,
  bodySchema: VerifyEmailRequest,
  openapi: {
    summary: "Verify customer email",
    description: "Verify customer email address using verification token",
    responses: {
      "200": { description: "Email verified successfully" },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "404": { description: "Token or customer not found" },
      "410": { description: "Token expired" },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const getSubscriptionsConfig = {
  method: "get" as const,
  handler: getSubscriptionsByIdController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get customer subscriptions",
    description: "Retrieve all subscriptions for a customer",
    responses: {
      "200": {
        description: "Customer subscriptions",
        schema: SubscriptionsResponse,
      },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error", schema: ErrorResponse },
    },
  },
} as const;

const getCustomerProfileConfig = {
  method: "get" as const,
  handler: getCustomerByIdController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get customer profile",
    description: "Retrieve customer profile information",
    responses: {
      "200": {
        description: "Customer profile",
        schema: CustomerProfileResponse,
      },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "404": { description: "Customer not found", schema: ErrorResponse },
      "500": { description: "Internal server error", schema: ErrorResponse },
    },
  },
} as const;

const updateCustomerProfileConfig = {
  method: "patch" as const,
  handler: updateCustomerProfileController,
  paramsSchema: CustomerIdParams,
  bodySchema: UpdateCustomerProfileRequest,
  openapi: {
    summary: "Update customer profile",
    description: "Update customer profile information",
    responses: {
      "200": { description: "Profile updated", schema: UpdateProfileResponse },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "404": { description: "Customer not found" },
      "409": { description: "Email already exists" },
      "500": { description: "Internal server error" },
      "503": { description: "Failed to send verification email" },
    },
  },
} as const;

const getRebookableClassesConfig = {
  method: "get" as const,
  handler: getRebookableClassesController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get rebookable classes",
    description: "Retrieve classes that can be rebooked for the customer",
    responses: {
      "200": {
        description: "Rebookable classes",
        schema: RebookableClassesResponse,
      },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const getUpcomingClassesConfig = {
  method: "get" as const,
  handler: getUpcomingClassesController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get upcoming classes",
    description: "Retrieve upcoming classes for the customer",
    responses: {
      "200": {
        description: "Upcoming classes",
        schema: UpcomingClassesResponse,
      },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const getCustomerClassesConfig = {
  method: "get" as const,
  handler: getClassesController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get customer classes",
    description: "Retrieve all classes for the customer",
    responses: {
      "200": {
        description: "Customer classes",
        schema: CustomerClassesResponse,
      },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const getChildProfilesConfig = {
  method: "get" as const,
  handler: getChildProfilesController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Get child profiles",
    description: "Retrieve child profiles for the customer",
    responses: {
      "200": { description: "Child profiles", schema: ChildProfilesResponse },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const markWelcomeSeenConfig = {
  method: "patch" as const,
  handler: markWelcomeSeenController,
  paramsSchema: CustomerIdParams,
  openapi: {
    summary: "Mark welcome message as seen",
    description: "Mark that customer has seen the welcome message",
    responses: {
      "200": { description: "Welcome message marked as seen" },
      "400": { description: "Invalid customer ID", schema: ErrorResponse },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const declineFreeTrialConfig = {
  method: "patch" as const,
  handler: declineFreeTrialClassController,
  paramsSchema: CustomerIdParams,
  bodySchema: DeclineFreeTrialRequest,
  openapi: {
    summary: "Decline free trial class",
    description: "Decline a free trial class for the customer",
    responses: {
      "200": { description: "Free trial class declined" },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "404": { description: "Class not found" },
      "500": { description: "Internal server error" },
    },
  },
} as const;

const registerSubscriptionConfig = {
  method: "post" as const,
  handler: registerSubscriptionController,
  paramsSchema: CustomerIdParams,
  bodySchema: RegisterSubscriptionRequest,
  openapi: {
    summary: "Register subscription",
    description: "Register a new subscription for the customer",
    responses: {
      "200": {
        description: "Subscription created",
        schema: NewSubscriptionResponse,
      },
      "400": { description: "Invalid request data", schema: ErrorResponse },
      "404": { description: "Plan not found", schema: ErrorResponse },
      "500": { description: "Internal server error", schema: ErrorResponse },
    },
  },
} as const;

// Route configurations for validation and OpenAPI
const routeConfigs = {
  "/check-email-conflicts": [checkEmailConflictsConfig],
  "/register": [registerConfig],
  "/verify-email": [verifyEmailConfig],
  "/:id": [updateCustomerProfileConfig],
  "/:id/child-profiles": [getChildProfilesConfig],
  "/:id/classes": [getCustomerClassesConfig],
  "/:id/customer": [getCustomerProfileConfig],
  "/:id/free-trial/decline": [declineFreeTrialConfig],
  "/:id/rebookable-classes": [getRebookableClassesConfig],
  "/:id/seen-welcome": [markWelcomeSeenConfig],
  "/:id/subscription": [registerSubscriptionConfig],
  "/:id/subscriptions": [getSubscriptionsConfig],
  "/:id/upcoming-classes": [getUpcomingClassesConfig],
} as const;

// Register all routes with validation
registerRoutes(customersRouter, routeConfigs);

// Export route configs for OpenAPI registration
export { routeConfigs as customersRouterConfig };

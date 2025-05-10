import express from "express";
import {
  getSubscriptionsByIdController,
  registerCustomerController,
  updateCustomerProfile,
  registerSubscriptionController,
  getUpcomingClassesController,
  getCustomerByIdController,
  getClassesController,
  getRebookableClassesController,
} from "../../src/controllers/customersController";
import { authenticateCustomerSession } from "../../src/middlewares/auth.middleware";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";

export const customersRouter = express.Router();

// http://localhost:4000/customers

customersRouter.post("/register", registerCustomerController);

customersRouter.get("/:id/subscriptions", getSubscriptionsByIdController);
customersRouter.get("/:id/customer", parseId, (req, res) =>
  getCustomerByIdController(req as RequestWithId, res),
);
customersRouter.get("/:id/rebookable-classes", parseId, (req, res) =>
  getRebookableClassesController(req as RequestWithId, res),
);
customersRouter.get("/:id/upcoming-classes", parseId, (req, res) =>
  getUpcomingClassesController(req as RequestWithId, res),
);
customersRouter.get("/:id/classes", parseId, (req, res) =>
  getClassesController(req as RequestWithId, res),
);

customersRouter.patch("/:id", updateCustomerProfile);
customersRouter.post("/:id/subscription", registerSubscriptionController);
customersRouter.get("/:id/authentication", authenticateCustomerSession);

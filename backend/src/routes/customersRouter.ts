import express from "express";
import {
  getCustomerById,
  getCustomersClasses,
  getSubscriptionsByIdController,
  loginCustomer,
  registerCustomerController,
  updateCustomerProfile,
  registerSubscriptionController,
  logoutCustomer,
  getBookableClassesController,
} from "../../src/controllers/customersController";
import { authenticateCustomerSession } from "../../src/middlewares/auth.middleware";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";

export const customersRouter = express.Router();

// http://localhost:4000/customers

customersRouter.post("/register", registerCustomerController);
customersRouter.post("/login", loginCustomer);
customersRouter.post("/logout", logoutCustomer);

customersRouter.get("/:id", getCustomersClasses);
customersRouter.get("/:id/subscriptions", getSubscriptionsByIdController);
customersRouter.get("/:id/customer", getCustomerById);
customersRouter.get("/:id/bookable-classes", parseId, (req, res) =>
  getBookableClassesController(req as RequestWithId, res),
);

customersRouter.patch("/:id", updateCustomerProfile);
customersRouter.post("/:id/subscription", registerSubscriptionController);
customersRouter.get("/:id/authentication", authenticateCustomerSession);

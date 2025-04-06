import { Request, Response } from "express";
import { prisma } from "../../prisma/prismaClient";
import {
  fetchCustomerById,
  getCustomerByEmail,
  registerCustomer,
  updateCustomer,
} from "../services/customersService";
import {
  getSubscriptionsById,
  createNewSubscription,
} from "../services/subscriptionsService";
import { getWeeklyClassTimes } from "../services/plansService";
import { createNewRecurringClass } from "../services/recurringClassesService";
import {
  EMAIL_ALREADY_REGISTERED_ERROR,
  GENERAL_ERROR_MESSAGE,
  REGISTRATION_SUCCESS_MESSAGE,
} from "../helper/messages";

export const registerCustomerController = async (
  req: Request,
  res: Response,
) => {
  const { name, email, password, prefecture } = req.body;

  if (!name || !email || !password || !prefecture) {
    return res.status(400).json({ message: GENERAL_ERROR_MESSAGE });
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingCustomer = await getCustomerByEmail(normalizedEmail);
    if (existingCustomer) {
      return res.status(409).json({ message: EMAIL_ALREADY_REGISTERED_ERROR });
    }

    await registerCustomer({
      name,
      email: normalizedEmail,
      password,
      prefecture,
    });

    res.status(201).json({
      message: REGISTRATION_SUCCESS_MESSAGE,
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: GENERAL_ERROR_MESSAGE });
  }
};

export const getCustomersClasses = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    // Fetch the Customer data from the DB
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Exclude the password from the response.
    const { password, ...customerWithoutPassword } = customer;

    res.json({ customer: customerWithoutPassword });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getSubscriptionsByIdController = async (
  req: Request,
  res: Response,
) => {
  const customerId = parseInt(req.params.id);

  try {
    const subscriptions = await getSubscriptionsById(customerId);

    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id);

  if (isNaN(customerId)) {
    return res.status(400).json({ error: "Invalid customer ID." });
  }

  try {
    const customer = await fetchCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const { password, ...customerWithoutPassword } = customer;
    res.json({ customer: customerWithoutPassword });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

export const updateCustomerProfile = async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.id);
  const { name, email, prefecture } = req.body;

  try {
    const customer = await updateCustomer(customerId, name, email, prefecture);

    res.status(200).json({
      message: "Customer is updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};

export const registerSubscriptionController = async (
  req: Request,
  res: Response,
) => {
  const customerId = parseInt(req.params.id);
  const { planId, startAt } = req.body;

  try {
    // Get weekly class times based on plan id.
    const data = await getWeeklyClassTimes(planId);
    if (!data) {
      res.status(404).json({ error: "Weekly class times not found" });
      return;
    }
    const { weeklyClassTimes } = data;

    // Create new subscription record.
    const subscriptionData = {
      planId,
      customerId,
      startAt: new Date(startAt),
    };
    const newSubscription = await createNewSubscription(subscriptionData);
    if (!newSubscription) {
      res.status(500).json({ error: "Failed to create subscription" });
      return;
    }
    const subscriptionId = newSubscription.id;

    // Create the same number of recurring class records as weekly class times
    for (let i = 0; i < weeklyClassTimes; i++) {
      const newRecurringClass = await createNewRecurringClass(subscriptionId);
      if (!newRecurringClass) {
        res.status(500).json({ error: "Failed to create recurring class" });
        return;
      }
    }

    res.status(200).json({ newSubscription });
  } catch (error) {
    res.status(500).json({ error });
  }
};

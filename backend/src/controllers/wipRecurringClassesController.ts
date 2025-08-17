import { Request, Response } from "express";
import {
  createRegularClass,
  getRegularClassById,
  getRegularClassesBySubscriptionId,
  updateRegularClass,
} from "../services/wipRecurringClassesService";
import { RequestWithId } from "../middlewares/parseId.middleware";

interface RegularClassParams {
  instructorId: number;
  weekday: number;
  startTime: string;
  customerId: number;
  childrenIds: number[];
  subscriptionId: number;
  startDate: string;
  timezone?: string;
}

function validateRegularClassParams(params: RegularClassParams): string | null {
  const {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    subscriptionId,
    startDate,
  } = params;

  if (
    !instructorId ||
    weekday === undefined ||
    !startTime ||
    !customerId ||
    !childrenIds ||
    !subscriptionId ||
    !startDate
  ) {
    return "Missing required parameters";
  }

  if (weekday < 0 || weekday > 6) {
    return "Invalid weekday. Must be 0-6";
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return "Invalid time format. Use HH:mm";
  }

  return null;
}

// Validation for updates - subscriptionId is not required since we get it from existing record
function validateUpdateRegularClassParams(
  params: Omit<RegularClassParams, "subscriptionId">,
): string | null {
  const {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    startDate,
  } = params;

  if (
    !instructorId ||
    weekday === undefined ||
    !startTime ||
    !customerId ||
    !childrenIds ||
    !startDate
  ) {
    return "Missing required parameters";
  }

  if (weekday < 0 || weekday > 6) {
    return "Invalid weekday. Must be 0-6";
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return "Invalid time format. Use HH:mm";
  }

  return null;
}

function handleRegularClassError(error: unknown, res: Response): Response {
  const err =
    error instanceof Error ? error : new Error("An unknown error occurred");

  const businessLogicErrors = [
    "Instructor is not available at the requested time slot",
    "Instructor schedule not found",
    "Only Asia/Tokyo timezone is supported",
    "Regular class already exists at this time slot",
    "Start date must be at least one week from today",
  ];

  if (businessLogicErrors.includes(err.message)) {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Regular class not found") {
    return res.status(404).json({ message: err.message });
  }

  return res.status(500).json({ error: err.message });
}

export const createRegularClassController = async (
  req: Request,
  res: Response,
) => {
  const {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    subscriptionId,
    startDate,
    timezone = "Asia/Tokyo",
  } = req.body;

  const params = {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    subscriptionId,
    startDate,
    timezone,
  };

  const validationError = validateRegularClassParams(params);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const recurringClass = await createRegularClass(params);

    res.status(201).json({
      message: "Regular class created successfully",
      recurringClass,
    });
  } catch (error) {
    return handleRegularClassError(error, res);
  }
};

export const getRegularClassesBySubscriptionIdController = async (
  req: Request,
  res: Response,
) => {
  const subscriptionId = parseInt(req.query.subscriptionId as string);
  const status = req.query.status as string;

  if (!req.query.subscriptionId) {
    return res.status(400).json({ message: "subscriptionId is required" });
  }

  if (isNaN(subscriptionId)) {
    return res.status(400).json({ message: "Invalid subscription ID" });
  }

  // Validate status parameter
  if (status && !["active", "history"].includes(status)) {
    return res
      .status(400)
      .json({ message: "status must be 'active' or 'history'" });
  }

  try {
    const recurringClasses = await getRegularClassesBySubscriptionId(
      subscriptionId,
      status as "active" | "history" | undefined,
    );

    res.json({ recurringClasses });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");
    res.status(500).json({ error: err.message });
  }
};

export const updateRegularClassController = async (
  req: RequestWithId,
  res: Response,
) => {
  const {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    startDate,
    timezone = "Asia/Tokyo",
  } = req.body;

  const updateParams = {
    instructorId,
    weekday,
    startTime,
    customerId,
    childrenIds,
    startDate,
    timezone,
  };

  const validationError = validateUpdateRegularClassParams(updateParams);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await updateRegularClass({
      recurringClassId: req.id,
      ...updateParams,
    });

    res.status(200).json({
      message: "Regular class updated successfully",
      oldRecurringClass: result.oldRecurringClass,
      newRecurringClass: result.newRecurringClass,
    });
  } catch (error) {
    return handleRegularClassError(error, res);
  }
};

export const getRegularClassByIdController = async (
  req: RequestWithId,
  res: Response,
) => {
  try {
    const recurringClass = await getRegularClassById(req.id);
    res.status(200).json(recurringClass);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");

    if (err.message === "Recurring class not found") {
      return res.status(404).json({ message: err.message });
    }

    console.error("Error getting recurring class by ID:", err);
    res.status(500).json({ error: err.message });
  }
};

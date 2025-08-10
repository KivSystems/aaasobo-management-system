import { Request, Response } from "express";
import {
  createRegularClass,
  getRegularClassesBySubscriptionId,
  updateRegularClass,
} from "../services/wipRecurringClassesService";
import { RequestWithId } from "../middlewares/parseId.middleware";

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

  if (
    !instructorId ||
    weekday === undefined ||
    !startTime ||
    !customerId ||
    !childrenIds ||
    !subscriptionId ||
    !startDate
  ) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  if (weekday < 0 || weekday > 6) {
    return res.status(400).json({ message: "Invalid weekday. Must be 0-6" });
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return res.status(400).json({ message: "Invalid time format. Use HH:mm" });
  }

  try {
    const recurringClass = await createRegularClass({
      instructorId,
      weekday,
      startTime,
      customerId,
      childrenIds,
      subscriptionId,
      startDate,
      timezone,
    });

    res.status(201).json({
      message: "Regular class created successfully",
      recurringClass,
    });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");

    // Handle specific business logic errors with 400 status
    if (
      err.message ===
        "Instructor is not available at the requested time slot" ||
      err.message === "Instructor schedule not found" ||
      err.message === "Only Asia/Tokyo timezone is supported" ||
      err.message === "Regular class already exists at this time slot"
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};

export const getRegularClassesBySubscriptionIdController = async (
  req: Request,
  res: Response,
) => {
  const subscriptionId = parseInt(req.query.subscriptionId as string);

  if (!req.query.subscriptionId) {
    return res.status(400).json({ message: "subscriptionId is required" });
  }

  if (isNaN(subscriptionId)) {
    return res.status(400).json({ message: "Invalid subscription ID" });
  }

  try {
    const recurringClasses =
      await getRegularClassesBySubscriptionId(subscriptionId);

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
    subscriptionId,
    startDate,
    timezone = "Asia/Tokyo",
  } = req.body;

  if (
    !instructorId ||
    weekday === undefined ||
    !startTime ||
    !customerId ||
    !childrenIds ||
    !subscriptionId ||
    !startDate
  ) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  if (weekday < 0 || weekday > 6) {
    return res.status(400).json({ message: "Invalid weekday. Must be 0-6" });
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return res.status(400).json({ message: "Invalid time format. Use HH:mm" });
  }

  try {
    const result = await updateRegularClass({
      recurringClassId: req.id,
      instructorId,
      weekday,
      startTime,
      customerId,
      childrenIds,
      subscriptionId,
      startDate,
      timezone,
    });

    res.status(200).json({
      message: "Regular class updated successfully",
      oldRecurringClass: result.oldRecurringClass,
      newRecurringClass: result.newRecurringClass,
    });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("An unknown error occurred");

    // Handle specific business logic errors
    if (err.message === "Regular class not found") {
      return res.status(404).json({ message: err.message });
    }

    if (
      err.message ===
        "Instructor is not available at the requested time slot" ||
      err.message === "Only Asia/Tokyo timezone is supported" ||
      err.message === "Regular class already exists at this time slot"
    ) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};
